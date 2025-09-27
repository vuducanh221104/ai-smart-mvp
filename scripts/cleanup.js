const fs = require('fs').promises;
const path = require('path');

async function cleanupTempFiles() {
  try {
    const tempDir = path.join(process.cwd(), 'temp');
    
    // Check if temp directory exists
    try {
      await fs.access(tempDir);
    } catch {
      console.log('Temp directory does not exist, nothing to clean up.');
      return;
    }
    
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      // Delete files older than 24 hours
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        deletedCount++;
        console.log(`Deleted: ${file}`);
      }
    }
    
    console.log(`Cleanup completed. Deleted ${deletedCount} expired files.`);
    
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupTempFiles();
}

module.exports = { cleanupTempFiles };
