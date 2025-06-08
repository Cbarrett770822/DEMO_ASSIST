const mongoose = require('mongoose');

const PresentationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    index: true // Add index for faster queries by userId
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  isLocal: {
    type: Boolean,
    default: false
  },
  fileType: {
    type: String,
    enum: ['ppt', 'pptx', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'other'],
    default: 'pptx'
  },
  sourceType: {
    type: String,
    enum: ['s3', 'dropbox', 'gdrive', 'gslides', 'onedrive', 'local', 'other'],
    default: 'other'
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to detect source type and file type
PresentationSchema.pre('save', function(next) {
  // Update the updatedAt timestamp
  this.updatedAt = new Date();
  
  // Detect file type from URL
  const url = this.url.toLowerCase();
  if (url.endsWith('.ppt')) this.fileType = 'ppt';
  else if (url.endsWith('.pptx')) this.fileType = 'pptx';
  else if (url.endsWith('.pdf')) this.fileType = 'pdf';
  else if (url.endsWith('.doc')) this.fileType = 'doc';
  else if (url.endsWith('.docx')) this.fileType = 'docx';
  else if (url.endsWith('.xls')) this.fileType = 'xls';
  else if (url.endsWith('.xlsx')) this.fileType = 'xlsx';
  else this.fileType = 'other';
  
  // Detect source type from URL
  if (this.isLocal) {
    this.sourceType = 'local';
  } else if (url.includes('s3.amazonaws.com')) {
    this.sourceType = 's3';
  } else if (url.includes('dropbox.com')) {
    this.sourceType = 'dropbox';
  } else if (url.includes('drive.google.com')) {
    this.sourceType = 'gdrive';
  } else if (url.includes('docs.google.com/presentation')) {
    this.sourceType = 'gslides';
  } else if (url.includes('onedrive.live.com') || url.includes('sharepoint.com')) {
    this.sourceType = 'onedrive';
  } else {
    this.sourceType = 'other';
  }
  
  next();
});

// Method to get direct download URL based on source type
PresentationSchema.methods.getDirectUrl = function() {
  let directUrl = this.url;
  
  if (this.isLocal) {
    return directUrl; // Local files are already direct URLs
  }
  
  // Process based on source type
  switch (this.sourceType) {
    case 'dropbox':
      // Convert dropbox.com/s/ links to dropbox.com/s/dl/ links
      directUrl = directUrl.replace('www.dropbox.com/s/', 'www.dropbox.com/s/dl/');
      // Remove query parameters
      directUrl = directUrl.split('?')[0];
      break;
      
    case 'gdrive':
      // Extract file ID and create direct download link
      const fileIdMatch = directUrl.match(/\/file\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
      break;
      
    case 'gslides':
      // Extract presentation ID and create export link
      const presentationIdMatch = directUrl.match(/\/presentation\/d\/([^\/]+)/);
      if (presentationIdMatch && presentationIdMatch[1]) {
        const presentationId = presentationIdMatch[1];
        directUrl = `https://docs.google.com/presentation/d/${presentationId}/export/pptx`;
      }
      break;
  }
  
  return directUrl;
};

// Method to get viewer URL
PresentationSchema.methods.getViewerUrl = function() {
  if (this.isLocal) {
    return null; // No viewer for local files
  }
  
  const directUrl = this.getDirectUrl();
  const encodedUrl = encodeURIComponent(directUrl);
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
};

module.exports = mongoose.models.Presentation || mongoose.model('Presentation', PresentationSchema);
