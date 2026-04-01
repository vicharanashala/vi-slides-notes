const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  sessionId: String,
  userId: String,
  text: String,
  anonymous: Boolean,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Question", QuestionSchema);