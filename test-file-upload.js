#!/usr/bin/env node

/**
 * Test script to demonstrate file upload functionality
 * This script creates a sample CV file and tests the upload endpoint
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import FormData from 'form-data';

const SERVER_URL = 'http://localhost:3001';

async function createTestFile() {
  const testContent = `
John Doe - Software Developer
============================

Experience:
-----------
• Senior Full Stack Developer at Tech Corp (2020-2023)
  - Developed React.js applications with TypeScript
  - Built REST APIs using Node.js and Express
  - Worked with PostgreSQL and MongoDB databases
  - Implemented CI/CD pipelines with GitHub Actions

• Full Stack Developer at StartupXYZ (2018-2020)  
  - Created responsive web applications
  - Integrated third-party APIs and payment systems
  - Collaborated with cross-functional teams

Skills:
-------
• Programming Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, SASS
• Backend: Node.js, Express, Python Flask/Django
• Databases: PostgreSQL, MongoDB, MySQL
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, VS Code, Jira, Slack

Education:
----------
• Bachelor of Computer Science - University of Technology (2018)
• Relevant Coursework: Data Structures, Algorithms, Database Design

Contact:
--------
• Email: john.doe@email.com
• Phone: (555) 123-4567
• LinkedIn: linkedin.com/in/johndoe
• GitHub: github.com/johndoe
`.trim();

  const fileName = 'test-cv.txt';
  const filePath = path.join(process.cwd(), fileName);
  
  await fs.writeFile(filePath, testContent);
  console.log(`✅ Created test file: ${fileName}`);
  
  return filePath;
}

async function testUpload(filePath, userId = 1, jobRoleId = 1) {
  try {
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    
    // Create form data
    const form = new FormData();
    form.append('userId', userId.toString());
    form.append('jobRoleId', jobRoleId.toString());
    form.append('cvFile', fileBuffer, {
      filename: fileName,
      contentType: 'text/plain',
    });

    console.log(`📤 Uploading file: ${fileName}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Job Role ID: ${jobRoleId}`);

    const response = await fetch(`${SERVER_URL}/api/applications`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('   Application ID:', result.data.id);
      console.log('   File Name:', result.data.cvFileName);
      console.log('   File Size:', result.data.cvFileSize, 'bytes');
      return result.data;
    } else {
      console.error('❌ Upload failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    return null;
  }
}

async function testAdminEndpoints() {
  console.log('\n📊 Testing admin endpoints...');
  
  try {
    // Test file stats
    const statsResponse = await fetch(`${SERVER_URL}/api/admin/file-stats`);
    const stats = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ File stats retrieved:');
      console.log('   Total applications:', stats.data.totalApplications);
      console.log('   Total files:', stats.data.totalFiles);
      console.log('   Missing files:', stats.data.missingFiles);
      console.log('   Total size:', stats.data.totalSizeFormatted);
      console.log('   Health score:', stats.data.healthScore + '%');
    }
    
    // Test validation
    const validateResponse = await fetch(`${SERVER_URL}/api/admin/validate-all-files`);
    const validation = await validateResponse.json();
    
    if (validateResponse.ok) {
      console.log('✅ File validation completed:');
      console.log('   Valid files:', validation.data.summary.validFiles);
      console.log('   Invalid files:', validation.data.summary.invalidFiles);
      console.log('   Health score:', validation.data.summary.healthScore + '%');
    }
    
  } catch (error) {
    console.error('❌ Admin endpoint error:', error.message);
  }
}

async function cleanup(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`🧹 Cleaned up test file: ${path.basename(filePath)}`);
  } catch (error) {
    console.error('⚠️  Could not clean up test file:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting file upload test...\n');
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${SERVER_URL}/`);
    if (!healthCheck.ok) {
      throw new Error('Server not responding');
    }
    console.log('✅ Server is running\n');
  } catch (error) {
    console.error('❌ Server is not running. Please start it with: npm run dev');
    process.exit(1);
  }

  let testFilePath;
  
  try {
    // Create test file
    testFilePath = await createTestFile();
    
    // Test upload
    const application = await testUpload(testFilePath);
    
    if (application) {
      // Test admin endpoints
      await testAdminEndpoints();
      
      console.log('\n✅ All tests completed successfully!');
      console.log(`📝 Application created with ID: ${application.id}`);
      console.log(`📂 File stored at: ${application.cvFilePath}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up
    if (testFilePath) {
      await cleanup(testFilePath);
    }
  }
}

// Run the test
main().catch(console.error);