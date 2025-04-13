const Todo = require("../models/Todo");
const User = require("../models/User");
const { exportToCsv } = require("../utils/exportCsv");

// Get all todos for a user with pagination and filtering
exports.getTodos = async (req, res, next) => {
  try {
    const { userId, page = 1, limit = 10, priority, tags, search } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        error: {
          code: "MISSING_USER_ID",
          message: "User ID is required",
          details: "Please provide a valid user ID in the query parameters"
        }
      });
    }

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

    res.status(200).json({
      message: "Todos retrieved successfully",
      data: {
        todos,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific todo
exports.getTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)
      .populate("assignedUsers", "username name")
      .populate("notes.user", "username name");

    if (!todo) {
      return res.status(404).json({
        error: {
          code: "TODO_NOT_FOUND",
          message: "Todo not found",
          details: `No todo found with ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      message: "Todo retrieved successfully",
      todo
    });
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
      return res.status(400).json({
        error: {
          code: "MISSING_TITLE",
          message: "Title is required",
          details: "Please provide a title for the todo"
        }
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: {
          code: "MISSING_USER_ID",
          message: "User ID is required",
          details: "Please provide a valid user ID"
        }
      });
    }

    // Validate assigned users
    if (assignedUsers && assignedUsers.length > 0) {
      const users = await User.find({ _id: { $in: assignedUsers } });
      if (users.length !== assignedUsers.length) {
        return res.status(400).json({
          error: {
            code: "INVALID_ASSIGNED_USERS",
            message: "One or more assigned users do not exist",
            details: "Please provide valid user IDs"
          }
        });
      }
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
    
    const populatedTodo = await Todo.findById(todo._id)
      .populate("assignedUsers", "username name")
      .populate("notes.user", "username name");

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
      const users = await User.find({ _id: { $in: assignedUsers } });
      if (users.length !== assignedUsers.length) {
        return res.status(400).json({
          error: {
            code: "INVALID_ASSIGNED_USERS",
            message: "One or more assigned users do not exist",
            details: "Please provide valid user IDs"
          }
        });
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
    )
    .populate("assignedUsers", "username name")
    .populate("notes.user", "username name");

    if (!todo) {
      return res.status(404).json({
        error: {
          code: "TODO_NOT_FOUND",
          message: "Todo not found",
          details: `No todo found with ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      message: "Todo updated successfully",
      todo
    });
  } catch (error) {
    next(error);
  }
};

// Delete a todo
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        error: {
          code: "TODO_NOT_FOUND",
          message: "Todo not found",
          details: `No todo found with ID: ${req.params.id}`
        }
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully",
      todoId: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

// Add a note to a todo
exports.addNote = async (req, res, next) => {
  try {
    const { content, userId } = req.body;

    if (!content) {
      return res.status(400).json({
        error: {
          code: "MISSING_NOTE_CONTENT",
          message: "Note content is required",
          details: "Please provide content for the note"
        }
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: {
          code: "MISSING_USER_ID",
          message: "User ID is required",
          details: "Please provide a valid user ID"
        }
      });
    }

    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        error: {
          code: "TODO_NOT_FOUND",
          message: "Todo not found",
          details: `No todo found with ID: ${req.params.id}`
        }
      });
    }

    todo.notes.push({ content, user: userId });
    await todo.save();

    const updatedTodo = await Todo.findById(req.params.id)
      .populate("assignedUsers", "username name")
      .populate("notes.user", "username name");

    res.status(201).json({
      message: "Note added successfully",
      todo: updatedTodo
    });
  } catch (error) {
    next(error);
  }
};

// Export todos to CSV
exports.exportTodos = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: {
          code: "MISSING_USER_ID",
          message: "User ID is required",
          details: "Please provide a valid user ID in the query parameters"
        }
      });
    }

    const todos = await Todo.find({ userId });
    
    if (!todos || todos.length === 0) {
      return res.status(200).json({
        message: "No todos found to export",
        data: []
      });
    }

    const csv = exportToCsv(todos);
    res.header("Content-Type", "text/csv");
    res.attachment("todos.csv");
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// Get all unique tags for a user
exports.getTags = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: {
          code: "MISSING_USER_ID",
          message: "User ID is required",
          details: "Please provide a valid user ID in the query parameters"
        }
      });
    }

    const tags = await Todo.distinct("tags", { userId });
    
    res.status(200).json({
      message: "Tags retrieved successfully",
      tags: tags || []
    });
  } catch (error) {
    next(error);
  }
};
