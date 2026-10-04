let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

console.log("Starting note count:", notes.length); // Expected: Starting note count: 5
console.table(notes);

function searchNotes(word) {
  const searchWord = word.toLowerCase();

  return notes.filter((note) =>
    note.text.toLowerCase().includes(searchWord)
  );
}

// Normal case: matches even with different capitalisation
console.log(searchNotes("MILK"));
// Expected: [{ id: 1, text: "Buy milk and bread", category: "personal" }]

// Edge case: no matching notes
console.log(searchNotes("football"));
// Expected: []

function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }

  return longest;
}

// Normal case
console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

// Edge case: temporarily test an empty array
const savedNotesForLongestTest = notes;
notes = [];

console.log(longestNote()); // Expected: null

// Restore the starting notes for the next functions
notes = savedNotesForLongestTest;

function countByCategory() {
  const counts = {};

  for (const note of notes) {
    const category = note.category;

    if (counts[category] === undefined) {
      counts[category] = 0;
    }

    counts[category] += 1;
  }

  return counts;
}

// Normal case
console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

// Edge case: no notes
const savedNotesForCategoryTest = notes;
notes = [];

console.log(countByCategory()); // Expected: {}

// Restore the notes
notes = savedNotesForCategoryTest;

function getSummary() {
  const counts = countByCategory();
  const noteWord = notes.length === 1 ? "note" : "notes";

  return `${notes.length} ${noteWord}: ${counts.personal ?? 0} personal, ${counts.work ?? 0} work, ${counts.study ?? 0} study.`;
}

// Normal case
console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

// Edge case: exactly one note
const savedNotesForSummaryTest = notes;
notes = [notes[0]];

console.log(getSummary());
// Expected: "1 note: 1 personal, 0 work, 0 study."

// Restore the notes
notes = savedNotesForSummaryTest;

function isDuplicate(text) {
  const cleanedText = text.trim().toLowerCase();

  return notes.some((note) =>
    note.text.trim().toLowerCase() === cleanedText
  );
}

// Normal case: a new note
console.log(isDuplicate("Learn functions")); // Expected: false

// Edge case: existing text with extra outer spaces and different case
console.log(isDuplicate("   BUY MILK AND BREAD   ")); // Expected: true

function addNote(text, category) {
  const cleanedText = text.trim();

  if (cleanedText.length === 0 || cleanedText.length > 200) {
    console.log("Rejected: note must be 1–200 characters.");
    return false;
  }

  if (isDuplicate(cleanedText)) {
    console.log("Rejected: this note already exists.");
    return false;
  }

  const allowedCategories = ["personal", "work", "study"];

  if (!allowedCategories.includes(category)) {
    console.log("Rejected: category must be personal, work or study.");
    return false;
  }

  let highestId = 0;

  for (const note of notes) {
    if (note.id > highestId) {
      highestId = note.id;
    }
  }

  notes.push({
    id: highestId + 1,
    text: cleanedText,
    category: category,
  });

  console.log(`Added: "${cleanedText}" (${category}).`);
  return true;
}

// Normal case
console.log(addNote("Learn functions", "study"));
// Expected: logs Added: "Learn functions" (study). Then true.

// Edge cases
console.log(addNote("   ", "personal"));
// Expected: logs the length rejection. Then false.

console.log(addNote("a".repeat(201), "study"));
// Expected: logs the length rejection. Then false.

console.log(addNote("  BUY MILK AND BREAD  ", "personal"));
// Expected: logs the duplicate rejection. Then false.

console.log(addNote("Plan the weekend", "other"));
// Expected: logs the category rejection. Then false.

console.log(notes.length); // Expected: 6