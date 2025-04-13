const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: String }],
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notes: [noteSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
todoSchema.index({ userId: 1 });
todoSchema.index({ tags: 1 });
todoSchema.index({ priority: 1 });
todoSchema.index({ completed: 1 });

module.exports = mongoose.model("Todo", todoSchema);
