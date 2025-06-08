const mongoose = require('mongoose');

/**
 * UserSettings Schema
 * Stores user-specific settings that persist across sessions
 */
const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  settings: {
    type: Object,
    default: {
      theme: 'light',
      fontSize: 'medium',
      notifications: true,
      autoSave: true,
      presentationViewMode: 'embed',
      lastVisitedSection: null
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
