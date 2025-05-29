const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: String
});

const ProcessSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  steps: [StepSchema]
});

module.exports = mongoose.models.Process || mongoose.model('Process', ProcessSchema);
