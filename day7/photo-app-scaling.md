# SnapShare Scaling Plan

SnapShare lets users upload photos and scroll a feed of photos
from people they follow.

## Assumptions

- Registered users: 10,000,000.
- Daily active users: 10% of registered users.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Each original photo is 2 MB.
- Each photo has one 50 KB thumbnail.
- Peak request rates are 5 times the average.
- For rough request estimates, one day is 100,000 seconds.
- One year is 365 days.
- Storage calculations use decimal units:
  1 MB = 1,000 KB and 1 TB = 1,000,000 MB.
- Photos and thumbnails are retained for the full year.
- Storage estimates exclude metadata, backups, and extra copies.

## Daily Active Users

10,000,000 × 10% = 1,000,000 daily active users.

## Traffic Estimates

### Photo uploads

- Daily uploads:
  1,000,000 active users × 1 photo = 1,000,000 uploads/day.
- Average uploads per second:
  1,000,000 ÷ 100,000 ≈ 10 uploads/second.
- Peak uploads per second:
  10 × 5 ≈ 50 uploads/second.

### Feed views

- Daily feed views:
  1,000,000 active users × 50 pages = 50,000,000 feed views/day.
- Average feed views per second:
  50,000,000 ÷ 100,000 ≈ 500 feed views/second.
- Peak feed views per second:
  500 × 5 ≈ 2,500 feed views/second.

These estimates count feed-page requests. Each page may also
cause several photo or thumbnail downloads, so image requests
and bandwidth must be estimated separately.

## Read-Heavy or Write-Heavy?

SnapShare is read-heavy: there are about 50 feed-page reads
for every photo upload. A CDN can serve photo files close to
users, a cache can reduce repeated feed queries, and a database
read replica can share the read workload.

## Storage Estimates

### Original photos

- Daily storage:
  1,000,000 photos × 2 MB = 2,000,000 MB = 2 TB/day.
- Yearly storage:
  2 TB × 365 = 730 TB/year.

### Thumbnails

- Daily storage:
  1,000,000 thumbnails × 50 KB = 50,000,000 KB = 50 GB/day.
- Yearly storage:
  50 GB × 365 = 18,250 GB = 18.25 TB/year.

### Total

730 TB + 18.25 TB = 748.25 TB of new storage per year.

This excludes metadata, backups, and additional copies.
Storage continues to grow if photos are retained beyond one year.

## Where Photos Are Stored

Original photos and thumbnails belong in object storage,
such as Amazon S3, rather than inside database rows.

Object storage is designed to hold and serve large files.
Keeping image files separate avoids making the database,
its backups, and replication unnecessarily large.

The database stores metadata such as the photo ID, owner ID,
caption, creation time, processing status, and object keys
for the original photo and thumbnail.

## Architecture

```text
Clients
  |
  +-- Photo downloads --> CDN --> Object storage
  |                              (originals + thumbnails)
  |
  +-- API requests --> Load balancer
                            |
                     +------+------+
                     |             |
                  App 1          App 2
                     |             |
                     +------+------+
                            |
                 Shared app connections:
                            |
          +-----------------+------------------+
          |                 |                  |
        Cache          Primary DB           Job queue
     (feed data)       (metadata)               |
                            |                   v
                       replication       Thumbnail worker
                            |              |          |
                            v              v          v
                       Read replica     Object     Primary DB
                      (read queries)    storage    (thumbnail
                                                    metadata)

Both app servers can access:
- The cache for feed data.
- The primary database for writes.
- The read replica for suitable read queries.
- Object storage for photo uploads.
- The queue for thumbnail jobs.

On a CDN cache miss, the CDN fetches the image from object storage.
```

## What Each Component Solves

- **Clients:** Let users upload photos and browse their feed.
- **CDN:** Delivers cached photos and thumbnails near users,
  reducing download latency and requests to object storage.
- **Load balancer:** Distributes API requests across healthy
  app servers so one app server does not handle all traffic.
- **App servers:** Authenticate users, enforce permissions,
  validate uploads, and coordinate feed and photo operations.
- **Cache:** Stores frequently requested feed data to reduce
  repeated database queries and speed up reads.
- **Primary database:** Stores users, follow relationships,
  photo metadata, and other lasting structured data.
- **Read replica:** Handles suitable read queries to reduce
  load on the primary, with possible replication lag.
- **Object storage:** Holds original photos and thumbnails
  without filling the database with large image files.
- **Job queue:** Buffers thumbnail jobs so uploads do not
  have to wait for image processing to finish.
- **Thumbnail worker:** Processes queued jobs, creates smaller
  images, and records where the thumbnails are stored.

  ## Upload Flow

1. The user selects a photo and sends an authenticated upload
   request over HTTPS to the load balancer.

2. The load balancer forwards the request to a healthy app server.

3. The app server checks the user's identity, permissions,
   file size, and supported image type.

4. The app server saves the original photo in object storage
   under a unique object key.

5. The app server creates a record in the primary database
   containing the owner, caption, original object key, creation
   time, and a thumbnail status of "pending".

6. The app server adds a thumbnail job to the queue, containing
   the photo ID and original object key.

7. After the upload and job submission succeed, the server
   responds with 201 Created and the photo metadata.
   The thumbnail may still be processing.

8. A worker takes the job, reads the original from object
   storage, and creates a thumbnail.

9. The worker saves the thumbnail in object storage and updates
   the primary database with its object key and "ready" status.

10. Relevant cached feed data is invalidated or refreshed so
    later reads can include the new photo and its thumbnail.

11. When someone views the photo, the client downloads it through
    the CDN; on a cache miss, the CDN fetches it from object storage.

Failed jobs are retried with back-off. Thumbnail processing
must be safe to repeat so a retried job does not create duplicate
records. Failed uploads and job submissions need recovery or
cleanup so unfinished work is not silently lost.

## Trade-offs

### 1. Faster reads versus fresh data

Caching feed data and reading from replicas reduces latency
and primary database load. However, cached feeds and replicas
may briefly show old data. Cache invalidation and short TTLs
limit staleness; reads needing immediate freshness can use
the primary database.

### 2. Fast upload responses versus immediate thumbnails

A queue lets the app respond without waiting for thumbnail
processing. However, users may briefly see a processing
placeholder, and the system must handle failed or retried jobs.

### 3. Reliability and scalability versus cost and complexity

Multiple app servers, a cache, a replica, and workers share
the workload and reduce some failure risks. They also cost
more and require monitoring, maintenance, and coordination.

This diagram does not remove every single point of failure:
the load balancer, primary database, cache, and queue also
need appropriate redundancy and recovery plans for production.