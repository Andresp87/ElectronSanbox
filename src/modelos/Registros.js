const { model, Schema } = require("mongoose");

const schema = new Schema({
  resourceId: { type: String, required: true },
  componente: { type: String, required: true },
  title: { type: String, required: true },
  nota: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  hu: { type: String },
  bug: { type: String },
  comentario: { type: String },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

module.exports = model("Registros", schema);
