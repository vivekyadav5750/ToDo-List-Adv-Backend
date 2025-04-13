const Todo = require("../models/Todo");
const User = require("../models/User");
const { exportToCsv } = require("../utils/exportCsv");

// Get all todos for a user with pagination and filtering
exports.getTodos = async (req, res, next) => {
  try {
    const { userId, page = 1, limit = 10, priority, tags, search } = req.query;
    const query = { userId };

    if (priority) query.priority = { $in: priority.split(",") };
    if (tags) query.tags = { $in: tags.split(",") };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const todos = await Todo.find(query)
      .populate("assignedUsers", "username name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Todo.countDocuments(query);
    res.json({
      todos,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific todo
exports.getTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// Create a new todo
exports.createTodo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      tags,
      assignedUsers,
      userId
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate assigned users
    try {
      if (assignedUsers && assignedUsers.length > 0) {
        const users = await User.find({ _id: { $in: assignedUsers } });
        if (users.length !== assignedUsers.length) {
          return res
            .status(400)
            .json({ message: "One or more assigned users do not exist" });
        }
      }
    } catch (error) {
      console.log("error", error);
      return res.status(400).json({
        message:
          "Error validating assigned users. One or more assigned users do not exist"
      });
    }

    const todo = new Todo({
      title,
      description,
      priority,
      tags,
      assignedUsers,
      userId
    });
    await todo.save();
    // Populate the assignedUsers field
    const populatedTodo = await Todo.findById(todo._id).populate(
      "assignedUsers",
      "username name"
    );
    console.log("populatedTodo", populatedTodo);
    res.status(201).json({
      message: "Todo created successfully",
      todo: populatedTodo
    });
  } catch (error) {
    next(error);
  }
};

// Update a todo
exports.updateTodo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      tags,
      assignedUsers,
      completed
    } = req.body;

    // Validate assigned users
    if (assignedUsers && assignedUsers.length > 0) {
      const users = await User.find({
        _id: { $in: assignedUsers }
      });
      if (users.length !== assignedUsers.length) {
        return res
          .status(400)
          .json({ message: "One or more assigned users do not exist" });
      }
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        priority,
        tags,
        assignedUsers,
        completed,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate("assignedUsers", "username name");

    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// Delete a todo
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json({ message: "Todo deleted" });
  } catch (error) {
    next(error);
  }
};

// Add a note to a todo
exports.addNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    const todo = await Todo.findById(req.params.id).populate(
      "assignedUsers",
      "username name"
    );
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.notes.push({ content });
    await todo.save();
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// Export todos to CSV
exports.exportTodos = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const todos = await Todo.find({ userId });

    const csv = exportToCsv(todos);
    res.header("Content-Type", "text/csv");
    res.attachment("todos.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// Get all unique tags for a user
exports.getTags = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const tags = await Todo.distinct("tags", { userId });
    res.json(tags);
  } catch (error) {
    next(error);
  }
};
