# Library Books API Design

This REST API lets clients list, view, create, update, and delete books.
Each book has an id, title, author, and publicationYear.

## 1. List all books

- Method: GET
- Path: /books
- Description: Return an array of all books.
- Request body: None.
- Success status: 200 OK.

## 2. Get one book

- Method: GET
- Path: /books/42
- Description: Return the book with ID 42.
- Request body: None.
- Success status: 200 OK.

## 3. Create a book

- Method: POST
- Path: /books
- Description: Create a book and return it with its assigned ID.
- Success status: 201 Created.
- Example request body:

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publicationYear": 1958
}
```

## 4. Update part of a book

- Method: PATCH
- Path: /books/42
- Description: Update the supplied fields of book 42.
- Success status: 200 OK.
- Example request body:

```json
{
  "title": "Updated Book Title"
}
```

## 5. Delete a book

- Method: DELETE
- Path: /books/42
- Description: Delete book 42.
- Request body: None.
- Success status: 204 No Content, with no response body.

## 6. List books by an author

- Method: GET
- Path: /books?author=Chinua%20Achebe
- Description: Return books filtered by the author query parameter.
- Request body: None.
- Success status: 200 OK, including an empty array if no books match.

## Request format

Requests with a JSON body use the header:
Content-Type: application/json

## Error responses

- 400 Bad Request: The submitted data is invalid.
  Example: POST /books with an empty title.
- 404 Not Found: The requested book does not exist.
  Example: GET /books/999 when no book has ID 999.