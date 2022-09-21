const { model, Schema } = require("mongoose");

const schema = new Schema({
  projectName: { type: String, required: true },
  projectComments: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

module.exports = model("Projects", schema, "projects");
