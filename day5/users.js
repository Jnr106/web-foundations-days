console.log("Day 5 users.js loaded");

const API_URL = "https://jsonplaceholder.typicode.com/users";

// Select the page elements
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Keep the loaded users for filtering later
let users = [];

// Display an array of users
function renderUsers(list) {
  usersList.replaceChildren();

    if (list.length === 0) {
    const message = document.createElement("li");
    message.textContent = "No users match your filter.";
    usersList.appendChild(message);
    return;
  }

  list.forEach((user) => {
    const li = document.createElement("li");

    const name = document.createElement("h2");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.textContent = `Email: ${user.email}`;

    const city = document.createElement("p");
    city.textContent = `City: ${user.address.city}`;

    const company = document.createElement("p");
    company.textContent = `Company: ${user.company.name}`;

    li.appendChild(name);
    li.appendChild(email);
    li.appendChild(city);
    li.appendChild(company);

    usersList.appendChild(li);
  });
}

// Fetch users from the API
async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadButton.disabled = true;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    users = await response.json();
    renderUsers(users);
    statusText.textContent = `Loaded ${users.length} users.`;
  } catch (error) {
    statusText.textContent = "Could not load users. Please try again.";
    console.error("Could not load users:", error.message);
  } finally {
    loadButton.disabled = false;
  }
}

// Run when the button is clicked
loadButton.addEventListener("click", loadUsers);

// Filter the stored users without another API request
filterInput.addEventListener("input", () => {
  const searchText = filterInput.value.trim().toLowerCase();

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchText)
  );

  renderUsers(filteredUsers);
});