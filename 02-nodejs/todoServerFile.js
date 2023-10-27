const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid");

const port = 3000;
const app = express();

app.use(bodyParser.json());

// 1.GET /todos - Retrieve all todo items
app.get("/todos", async (req, res) => {
  try {
    const data = await fs.readFile("todos.json", { encoding: "utf-8" });
    const todos = await JSON.parse(data);
    res.status(200).json(todos);
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 2.GET /todos/:id - Retrieve a specific todo item by ID
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile("todos.json", { encoding: "utf-8" });
    const todos = await JSON.parse(data);
    const currentTodo = todos?.find((todo) => todo?.id === id);
    if (currentTodo?.id) {
      res.status(200).json(currentTodo);
    } else {
      res.status(404).json({ error: `Todo not found with id ${id}` });
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 3. POST /todos - Create a new todo item
app.post("/todos", async (req, res) => {
  try {
    const { title = "", description = "", completed = false } = req?.body;

    // check for required params
    if (title.length <= 0 || description.length <= 0) {
      res.status(400).json({ error: "Title or Description is not provided" });
      return;
    }
    const data = await fs.readFile("todos.json", { encoding: "utf-8" });
    const todos = await JSON.parse(data);
    const id = uuidv4();
    const newTodo = { id, title, description, completed };
    todos.push(newTodo);
    await fs.writeFile("todos.json", JSON.stringify(todos), {
      encoding: "utf-8",
    });
    res.status(201).json({ id });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 4. PUT /todos/:id - Update an existing todo item by ID
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req?.body;
    const data = await fs.readFile("todos.json", { encoding: "utf-8" });
    const todos = await JSON.parse(data);
    const currentTodo = todos?.find((todo) => todo?.id === id);
    if (currentTodo?.id) {
      if (title) currentTodo.title = title;
      if (description) currentTodo.description = description;
      if (completed !== undefined) currentTodo.completed = completed;
      await fs.writeFile("todos.json", JSON.stringify(todos), {
        encoding: "utf-8",
      });
      res.status(200).json(currentTodo);
    } else {
      res.status(404).json({ error: `Todo not found with id ${id}` });
    }
  } catch (error) {}
});

// 5. DELETE /todos/:id - Delete a todo item by ID
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile("todos.json", { encoding: "utf-8" });
    let todos = await JSON.parse(data);
    const currentTodo = todos?.find((todo) => todo?.id === id);
    if (currentTodo?.id) {
      todos = todos?.filter((todo) => todo?.id !== id);
      await fs.writeFile("todos.json", JSON.stringify(todos), {
        encoding: "utf-8",
      });
      res.status(200).json({ message: "Todo deleted successfully" });
    } else {
      res.status(404).json({ error: `Todo not found with id ${id}` });
    }
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Running on ${port}`);
});

// module.exports = app;
