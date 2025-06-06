
const path = require('path');
const fs = require('fs').promises;

/**
 * Upload file utility (basic implementation)
 * In production, you'd want to use cloud storage like AWS S3 or Cloudinary
 */
const uploadFile = async (file, folder = 'uploads') => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    await fs.writeFile(filePath, file.buffer);

    // Return relative URL
    return `/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Delete file utility
 */
const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    const filePath = path.join(__dirname, '..', fileUrl);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('File deletion error:', error);
    // Don't throw error for file deletion failures
  }
};

module.exports = {
  uploadFile,
  deleteFile
};
