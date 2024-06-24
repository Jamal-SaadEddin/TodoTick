import { useEffect, useState } from "react";

class TodoItem {
  constructor(todo) {
    this.id = new Date().getMilliseconds();
    this.todo = todo;
    this.userId = new Date().getUTCDay();
    this.completed = false;
  }
}

function App() {
  const [todoList, setTodoList] = useState([]);
  const [displayedTodos, setDisplayedTodos] = useState([]);
  const [todoNewInput, setTodoNewInput] = useState("");
  const todos = "todos";
  const fetchingKey = "fetchingKey";

  useEffect(() => {
    const storedTodos = localStorage.getItem(todos);
    if (storedTodos) {
      setTodoList(JSON.parse(storedTodos));
    } else {
      localStorage.setItem(fetchingKey, "false");
      fetchTodos(); // Fetch todos only if local storage is empty
    }
  }, []);

  useEffect(() => {
    setDisplayedTodos(todoList);
    if (todoList.length > 0 || localStorage.getItem(todos) === null) {
      localStorage.setItem(todos, JSON.stringify(todoList));
    }
  }, [todoList]);

  function toggleTodoComplete(id) {
    const updatedList = todoList.map((td) =>
      td.id !== id ? td : { ...td, completed: !td.completed }
    );
    setTodoList(updatedList);
  }

  function removeTodo(id) {
    if (window.confirm("Are you sure you want to remove this todo?")) {
      const updatedList = todoList.filter((td) => td.id !== id);
      setTodoList(updatedList);
    }
  }

  function addTodo() {
    const description = todoNewInput.trim();
    setTodoNewInput("");
    if (description === "") {
      alert("Todo description cannot be empty.");
      return;
    }
    const newTodo = new TodoItem(description);
    setTodoList([newTodo, ...todoList]);
  }

  function handleSearchChange(e) {
    const searchText = e.target.value;
    if (searchText !== "") {
      const filtered = todoList.filter((todo) =>
        todo.todo.toLowerCase().includes(searchText.toLowerCase().trim())
      );
      setDisplayedTodos(filtered);
    } else {
      setDisplayedTodos(todoList);
    }
  }

  async function fetchTodos() {
    if (localStorage.getItem(fetchingKey) === "false") {
      localStorage.setItem(fetchingKey, "true");
      try {
        const response = await fetch("https://dummyjson.com/todos");
        const { todos: tasks } = await response.json();
        setTodoList(tasks);
        localStorage.setItem(fetchingKey, "false"); // Reset flag
      } catch (error) {
        console.error("Error fetching todos: ", error);
        localStorage.setItem(fetchingKey, "false"); // Reset flag on error as well
      }
    }
  }

  return (
    <div>
      <header>
        <h1>
          <img
            src="images/logo-black-removebg-preview.png"
            alt="TodoTick Logo"
          />
        </h1>
        <div>
          <input
            data-new-todo-input
            type="text"
            placeholder="Add new task..."
            value={todoNewInput}
            onInput={(e) => setTodoNewInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
          />
          <button data-add-button className="red-bg" onClick={addTodo}>
            Add
          </button>
        </div>
        <input
          data-search-todo-input
          className="search-input"
          type="search"
          placeholder="Search tasks..."
          onInput={handleSearchChange}
        />
      </header>
      <main>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>TODO Description</th>
              <th>User ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody data-todos-container>
            {displayedTodos.map((todo) => (
              <tr
                key={todo.id}
                data-todo-id={todo.id}
                className={`todo ${todo.completed && "todo-completed"}`}
              >
                <td>{todo.id}</td>
                <td>{todo.todo}</td>
                <td>{todo.userId}</td>
                <td>{todo.completed ? "Completed" : "Pending"}</td>
                <td>
                  <button
                    className="delete-todo red-bg"
                    onClick={() => removeTodo(todo.id)}
                  >
                    Delete
                  </button>
                  <button
                    className={`complete-todo ${
                      todo.completed ? "blue-bg" : "green-bg"
                    } m-10`}
                    onClick={() => toggleTodoComplete(todo.id)}
                  >
                    {todo.completed ? "Redo" : "Done"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td data-total-todos-counter colSpan="5">
                Total Tasks: {displayedTodos.length}
              </td>
            </tr>
          </tfoot>
        </table>
      </main>
      <footer>
        <p>Copyright &copy; {new Date().getFullYear()} TodoTick.</p>
      </footer>
    </div>
  );
}

export default App;
