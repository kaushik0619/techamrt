import fs from 'fs';
import path from 'path';

const searchDirectory = 'src';
const searchTerm = 'supabase';
const foundFiles = [];

function searchInDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      searchInDirectory(filePath);
    } else if (stat.isFile()) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(searchTerm)) {
          foundFiles.push(filePath);
        }
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
      }
    }
  }
}

try {
  console.log(`Searching for "${searchTerm}" in "${searchDirectory}"...`);
  searchInDirectory(searchDirectory);

  if (foundFiles.length > 0) {
    console.log('\nFound references to "supabase" in the following files:');
    foundFiles.forEach(file => console.log(`- ${file}`));
  } else {
    console.log('\nScan complete. No references to "supabase" were found in the src directory.');
  }
} catch (err) {
  console.error(`\nAn error occurred during the search:`, err);
}
