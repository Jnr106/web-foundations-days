// 1. Select the page elements
const textarea = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearButton = document.querySelector("#clear-btn");
const themeButton = document.querySelector("#theme-toggle");

// 2. Define the storage keys
const DRAFT_KEY = "day4-note-draft";
const THEME_KEY = "day4-theme";

// 3. Update the character and word counters
function updateCounts() {
  const text = textarea.value;
  const characters = text.length;
  const cleanedText = text.trim();

  const words =
    cleanedText === "" ? 0 : cleanedText.split(/\s+/).length;

  charCount.textContent = `${characters} / 200 characters`;
  wordCount.textContent = `${words} words`;

  charCount.classList.toggle(
    "warning",
    characters > 180 && characters <= 200
  );

  charCount.classList.toggle("over", characters > 200);
}

// 4. Clear the text, counters, and saved draft
function clearDraft() {
  textarea.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
  textarea.focus();
}

// 5. Apply light or dark mode
function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeButton.textContent = isDark ? "Light mode" : "Dark mode";
}

// 6. Update counters and save the draft while typing
textarea.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem(DRAFT_KEY, textarea.value);
});

// 7. Handle the Clear button
clearButton.addEventListener("click", clearDraft);

// 8. Handle Escape inside the textarea
textarea.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearDraft();
  }
});

// 9. Toggle the theme and save the choice
themeButton.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");

  applyTheme(isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});

// 10. Restore the saved draft and theme when the page loads
const savedDraft = localStorage.getItem(DRAFT_KEY);
textarea.value = savedDraft ?? "";

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme === "dark");

updateCounts();