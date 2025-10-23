# Migration Guide: Text-based CVs to File Uploads

This guide explains how to migrate from the old text-based CV system to the new file upload system.

## Overview

The application system has been updated to support file uploads instead of text-based CVs. This change affects:

- **Database schema**: New columns for file metadata
- **API endpoints**: Changed from text input to multipart file upload
- **File storage**: New file system for CV storage
- **Validation**: File type and size validation instead of text validation

## Database Changes

### New Schema

The `applications` table has been updated with new columns:

**Removed:**
- `cv_text` (TEXT) - The original CV text field

**Added:**
- `cv_file_name` (TEXT NOT NULL) - Original filename
- `cv_file_path` (TEXT NOT NULL) - Server storage path
- `cv_file_type` (TEXT NOT NULL) - MIME type
- `cv_file_size` (INTEGER NOT NULL) - File size in bytes

### Migration Script

The database migration has already been applied automatically. If you need to manually run it:

```bash
# Generate migration (already done)
npm run db:generate

# Apply migration to database
npm run db:push
```

The migration file: `drizzle/0005_clever_miek.sql`

## API Changes

### Before (Text-based)

```http
POST /api/applications
Content-Type: application/json

{
  "userId": 1,
  "jobRoleId": 1,
  "cvText": "John Doe - Software Developer\n\nExperience:\n..."
}
```

### After (File-based)

```http
POST /api/applications
Content-Type: multipart/form-data

userId=1
jobRoleId=1
cvFile=[File object]
```

### Frontend Integration Changes

**Before:**
```javascript
// Old text-based approach
const applicationData = {
  userId: 1,
  jobRoleId: 1,
  cvText: document.getElementById('cvText').value
};

fetch('/api/applications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(applicationData)
});
```

**After:**
```javascript
// New file-based approach
const formData = new FormData();
formData.append('userId', '1');
formData.append('jobRoleId', '1');
formData.append('cvFile', fileInput.files[0]);

fetch('/api/applications', {
  method: 'POST',
  body: formData
  // Note: Don't set Content-Type header - let browser set it automatically
});
```

## File Storage Structure

Files are now stored in a structured directory system:

```
uploads/
└── cvs/
    ├── 2024/
    │   ├── 01/
    │   │   ├── 1704067200000-randomstring-cv.docx
    │   │   └── 1704067300000-anothercv-resume.png
    │   └── 12/
    │       └── 1703980800000-yearend-application.doc
    └── 2025/
        └── 10/
            └── 1729756800000-newapplication-cv.docx
```

### File Naming Convention

Files are renamed using the pattern:
```
{timestamp}-{randomstring}-{sanitized-original-name}.{extension}
```

Where:
- `timestamp`: Unix timestamp in milliseconds
- `randomstring`: Random string for uniqueness
- `sanitized-original-name`: Original filename with special characters removed
- `extension`: Original file extension

## Validation Changes

### Text Validation (Old)
- Minimum length: 50 characters
- Maximum length: 10,000 characters
- Required field validation

### File Validation (New)
- **File types**: `.doc`, `.docx`, `.png`
- **File size**: Maximum 10MB
- **MIME type validation**: Must match file extension
- **Required field**: File upload is mandatory

## Data Migration for Existing Applications

> **⚠️ Important**: Existing applications with `cv_text` data cannot be automatically migrated to files since text cannot be converted to file objects.

### Options for Existing Data

1. **Keep existing data as-is**: Old applications retain their text-based CVs but cannot be edited using the new system
2. **Manual migration**: Users must re-submit applications with file uploads
3. **Hybrid approach**: Support both old and new formats (requires code changes)

### Recommended Migration Strategy

**For development/testing:**
1. Clear existing application data
2. Re-seed with new file-based applications
3. Test the new file upload system

```bash
# Clear applications table (development only)
npm run db:studio
# Manually delete application records

# Test with new file uploads
node test-file-upload.js
```

**For production:**
1. Notify users about the system update
2. Provide a migration period where users can re-submit applications
3. Archive old text-based applications
4. Switch to file-only system after migration period

## Testing the Migration

### 1. Test File Upload

```bash
# Start the server
npm run dev

# In another terminal, run the test script
node test-file-upload.js
```

### 2. Verify File Storage

```bash
# Check if files are being stored correctly
ls -la uploads/cvs/

# Check file permissions
ls -la uploads/cvs/2025/10/
```

### 3. Test API Endpoints

```bash
# Test file serving
curl -I http://localhost:3001/api/files/cv/1

# Test file metadata
curl http://localhost:3001/api/files/cv/1/info

# Test admin endpoints
curl http://localhost:3001/api/admin/file-stats
```

## Error Handling

### Common Migration Issues

1. **Permission errors**
   ```
   Error: EACCES: permission denied, mkdir 'uploads/cvs'
   ```
   **Solution**: Ensure the application has write permissions to the uploads directory

2. **File size errors**
   ```
   Error: File too large
   ```
   **Solution**: Check `MAX_CV_FILE_SIZE` environment variable

3. **MIME type errors**
   ```
   Error: File type not supported
   ```
   **Solution**: Ensure file extensions match supported types

### Debugging File Uploads

Enable detailed logging by checking the server console output during file uploads. The system logs:

- File validation results
- Storage path creation
- File system operations
- Database insertions

## Environment Configuration

Update your `.env` file with file upload settings:

```bash
# File Upload Configuration
MAX_CV_FILE_SIZE=10485760          # 10MB
CV_UPLOAD_DIR=./uploads/cvs        # Storage directory
ALLOWED_CV_EXTENSIONS=doc,docx,png # Allowed file types
```

## Rollback Plan

If you need to rollback to the text-based system:

1. **Database rollback**: Revert the migration
   ```bash
   # Manual rollback by restoring database backup
   cp data/database.sqlite.backup data/database.sqlite
   ```

2. **Code rollback**: Checkout previous commit
   ```bash
   git checkout <previous-commit-hash>
   ```

3. **Clean up files**: Remove uploaded files
   ```bash
   rm -rf uploads/cvs/
   ```

## Performance Considerations

### File Storage Performance
- Files are stored on local filesystem (fast access)
- Consider cloud storage (S3, etc.) for production scale
- Implement file cleanup routines for old files

### Database Performance
- File metadata is small (filename, path, size, type)
- File content is not stored in database (good for performance)
- Consider indexing file-related columns for large datasets

## Security Considerations

### File Upload Security
- ✅ File type validation (MIME type + extension)
- ✅ File size limits (10MB maximum)
- ✅ File storage outside web root
- ✅ Unique file naming (prevents conflicts)
- ❌ File content scanning (not implemented)
- ❌ Virus scanning (not implemented)

### Production Recommendations
- Add virus scanning for uploaded files
- Implement file content validation
- Add rate limiting for file uploads
- Use cloud storage with proper access controls
- Enable file encryption at rest

## Post-Migration Checklist

- [ ] Database migration applied successfully
- [ ] File upload endpoint accepts multipart data
- [ ] Files are stored in correct directory structure
- [ ] File serving endpoints work correctly
- [ ] File metadata endpoints return correct information
- [ ] Admin endpoints provide file management capabilities
- [ ] Frontend updated to use file upload instead of text area
- [ ] Validation works for file types and sizes
- [ ] Error handling works for upload failures
- [ ] Permissions set correctly on upload directories
- [ ] Environment variables configured properly
- [ ] Tests pass (excluding old text-based tests)
- [ ] Documentation updated

## Support

If you encounter issues during migration:

1. Check server logs for detailed error messages
2. Verify file permissions on the uploads directory
3. Test with small files first to isolate issues
4. Use the admin endpoints to verify file system health
5. Check the API documentation for correct request formats

## Conclusion

The migration from text-based CVs to file uploads provides:

- ✅ Better user experience (real CV file uploads)
- ✅ Support for multiple file formats
- ✅ Proper file management and organization
- ✅ File integrity validation
- ✅ Admin tools for file system management

The new system is more robust and scalable for handling job applications with actual CV files.