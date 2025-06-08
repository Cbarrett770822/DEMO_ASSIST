const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  videoUrl: String
});

const ProcessSchema = new mongoose.Schema({
  id: String,
  title: String,  // Added title field to match the data we're saving
  name: String,   // Keep name for backward compatibility
  description: String,
  category: String,
  userId: String,  // For user-specific filtering
  updatedAt: Date,
  updatedBy: String,
  steps: [StepSchema]
}, { 
  // This ensures that virtuals are included when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual getter that ensures title and name are synchronized
ProcessSchema.virtual('displayTitle').get(function() {
  return this.title || this.name;
});

// Middleware to ensure title and name are synchronized
ProcessSchema.pre('save', function(next) {
  if (this.title && !this.name) {
    this.name = this.title;
  } else if (this.name && !this.title) {
    this.title = this.name;
  }
  next();
});

module.exports = mongoose.models.Process || mongoose.model('Process', ProcessSchema);
