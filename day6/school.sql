-- Enable foreign-key enforcement in SQLite.
PRAGMA foreign_keys = ON;

-- Each student has a unique ID and email address.
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- Each course has a unique ID.
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

-- Each row records one student's enrolment on one course.
CREATE TABLE enrolments (
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade REAL CHECK (grade >= 0 AND grade <= 100),

  PRIMARY KEY (student_id, course_id),

  FOREIGN KEY (student_id)
    REFERENCES students(id) ON DELETE CASCADE,

  FOREIGN KEY (course_id)
    REFERENCES courses(id) ON DELETE CASCADE
);

-- Sample students
INSERT INTO students (id, name, email) VALUES
  (1, 'Amina Otieno', 'amina@example.com'),
  (2, 'Brian Kamau', 'brian@example.com'),
  (3, 'Grace Ndlovu', 'grace@example.com'),
  (4, 'Thabo Mokoena', 'thabo@example.com');

-- Sample courses
INSERT INTO courses (id, name) VALUES
  (1, 'Web Development'),
  (2, 'Database Fundamentals'),
  (3, 'Networking Basics');

-- Sample enrolments and grades
INSERT INTO enrolments (student_id, course_id, grade) VALUES
  (1, 1, 85),
  (1, 2, 78),
  (2, 1, 72),
  (2, 3, 88),
  (3, 2, 91);

  -- Query 1: All courses for Amina Otieno
SELECT
  students.name AS student_name,
  courses.name AS course_name,
  enrolments.grade
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses ON courses.id = enrolments.course_id
WHERE students.name = 'Amina Otieno'
ORDER BY courses.name;

-- Query 2: All students on Web Development
SELECT
  courses.name AS course_name,
  students.name AS student_name,
  enrolments.grade
FROM courses
JOIN enrolments ON enrolments.course_id = courses.id
JOIN students ON students.id = enrolments.student_id
WHERE courses.name = 'Web Development'
ORDER BY students.name;

-- Query 3: Number of students per course
SELECT
  courses.name AS course_name,
  COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id, courses.name
ORDER BY courses.name;

-- Query 4: Students who have no enrolments
SELECT
  students.id,
  students.name,
  students.email
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE enrolments.student_id IS NULL
ORDER BY students.name;

-- Query 5: Update Amina's Web Development grade
UPDATE enrolments
SET grade = 90
WHERE student_id = 1 AND course_id = 1;

-- Check the updated enrolment
SELECT student_id, course_id, grade
FROM enrolments
WHERE student_id = 1 AND course_id = 1;

