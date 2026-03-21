const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(
  __dirname,
  '../../api/data/motocareservice.test.sqlite',
);

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log(`Deleted test DB: ${dbPath}`);
} else {
  console.log(`Test DB not found, nothing to delete: ${dbPath}`);
}
