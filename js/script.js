class TodoItem {
  constructor(todo) {
    this.id = new Date().getMilliseconds();
    this.todo = todo;
    this.userId = new Date().getUTCDay();
    this.completed = false;
  }
}

let todoList = []; // Array to hold TodoItem objects

// DOM element references
const todosContainer = document.querySelector("[data-todos-container]");
const todoSearchInput = document.querySelector("[data-search-todo-input]");
const todoNewInput = document.querySelector("[data-new-todo-input]");
const addButton = document.querySelector("[data-add-button]");
const totalTodoCounter = document.querySelector("[data-total-todos-counter]");

// Local storage keys
const todos = "todos";
const fetchingKey = "fetchingKey";

// Initialize local storage for todos
if (!localStorage.getItem(todos)) {
  localStorage.setItem(todos, JSON.stringify([]));
} else {
  todoList = JSON.parse(localStorage.getItem(todos));
}

// Initialize local storage for fetching state
if (localStorage.getItem(fetchingKey) !== "true")
  localStorage.setItem(fetchingKey, "false");

function addTodo() {
  const description = todoNewInput.value.trim();
  todoNewInput.value = "";
  if (description === "") {
    alert("Todo description cannot be empty.");
    return;
  }
  todoList.push(new TodoItem(description));
  saveTodosAndUpdateDisplay();
}

function toggleTodoComplete(index) {
  todoList[index].completed = !todoList[index].completed;
  saveTodosAndUpdateDisplay();
}

function removeTodo(index) {
  if (confirm("Are you sure you want to remove this todo?")) {
    todoList.splice(index, 1);
    saveTodosAndUpdateDisplay();
  }
}

// Event Listeners
addButton.addEventListener("click", addTodo);
todoNewInput.addEventListener("keydown", (event) => {
  // if enter key is pressed
  if (event.keyCode == 13) addTodo(event);
});

todoSearchInput.addEventListener("input", () => {
  displayTodos(
    todoSearchInput.value ? filterTodos(todoSearchInput.value) : todoList
  );
});

todosContainer.addEventListener("click", (event) => {
  let target = event.target;

  if (target.tagName.toLowerCase() === "button") {
    let todoElement = event.target.closest(".todo");
    let todoId = parseInt(todoElement.dataset.todoId);
    let todo = todoList.filter((todo) => todo.id === todoId)[0];
    let todoIndex = todoList.findIndex((todo) => todo.id === todoId);

    if (target.classList.contains("complete-todo")) {
      target.classList.add(todo.completed ? "green-bg" : "blue-bg");
      target.classList.remove(todo.completed ? "blue-bg" : "green-bg");
      toggleTodoComplete(todoIndex);
    } else if (target.classList.contains("delete-todo")) removeTodo(todoIndex);
  }
});

function saveTodosAndUpdateDisplay() {
  localStorage.setItem(todos, JSON.stringify(todoList));
  displayTodos();
}

function displayTodos(list = todoList) {
  resetElement(todosContainer);
  list.forEach((todo) => todosContainer.appendChild(createTodoElement(todo)));
  updateTodoCounters();
}

function updateTodoCounters() {
  setTextContent(totalTodoCounter, `Total tasks: ${todoList.length}`);
}

function setTextContent(element, text) {
  resetElement(element);
  element.textContent = text;
}

function resetElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function createTodoElement(todo) {
  const element = document.createElement("tr");
  element.setAttribute("data-todo-id", todo.id);
  element.className = `todo${todo.completed ? " todo-completed" : ""}`;

  element.innerHTML = `
    <td>${todo.id}</td>
    <td>${todo.todo}</td>
    <td>${todo.userId}</td>
    <td>${todo.completed ? "Completed" : "Pending"}</td>
    <td><button class="delete-todo red-bg">Delete</button><button class="complete-todo ${
      todo.completed ? "blue-bg" : "green-bg"
    } m-10">${todo.completed ? "Redo" : "Done"}</button></td>
  `;

  return element;
}

async function fetchTodos() {
  if (localStorage.getItem(fetchingKey) === "false") {
    localStorage.setItem(fetchingKey, "true");
    try {
      const response = await fetch("https://dummyjson.com/todos");
      const { todos } = await response.json();
      todoList.push(...todos);
      saveTodosAndUpdateDisplay();
    } catch (error) {
      console.error("Error fetching todos: ", error);
    }
  }
}

function filterTodos(searchText) {
  return todoList.filter((todo) =>
    todo.todo.toLowerCase().includes(searchText.toLowerCase().trim())
  );
}

// Initial Setup
fetchTodos();
displayTodos();
