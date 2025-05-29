const mongoose = require('mongoose');

const PresentationSchema = new mongoose.Schema({
  id: Number,
  title: String,
  url: String,
  description: String,
  isLocal: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if the model already exists before creating it
module.exports = mongoose.models.Presentation || mongoose.model('Presentation', PresentationSchema);
