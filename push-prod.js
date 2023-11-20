// test-prod.js
const { execSync } = require('child_process');

const version = process.env.VERSION;

console.log(`Version: ${version}`);

// Execute your .sh script using execSync
execSync('push-prod.sh');