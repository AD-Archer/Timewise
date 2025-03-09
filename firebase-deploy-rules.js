// Script to deploy Firestore rules
// Run with: node firebase-deploy-rules.js

const { execSync } = require('child_process');

console.log('Deploying Firestore security rules...');

try {
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Firebase CLI is not installed. Please install it with:');
    console.error('npm install -g firebase-tools');
    process.exit(1);
  }

  // Deploy only Firestore rules
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('Firestore rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Firestore rules:', error.message);
  process.exit(1);
} 