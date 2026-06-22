const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (file.endsWith('.json')) {
      let text = fs.readFileSync(full, 'utf8');
      if (text.includes('"author": "Aaron"')) {
        text = text.replace(/"author": "Aaron"/g, '"author": "Aroid Aaron"');
        fs.writeFileSync(full, text, 'utf8');
        console.log('Updated:', full);
      }
    }
  });
}

walk(path.join(__dirname, '../content/plants'));
console.log('Finished renaming author in JSON files.');
