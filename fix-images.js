import fs from 'fs';
import path from 'path';

const srcDir = path.join(__dirname, 'frontend', 'src');

const replacements = [
  {
    pattern: /https:\/\/scontent.*?\.fbcdn\.net\/v\/.*?heroBanner.*?/g,
    replacement: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
  },
  {
    pattern: /https:\/\/scontent.*?\.fbcdn\.net\/v\/.*?(logoImg|logoMain|logoSana3).*?/g,
    replacement: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=60" // Placeholder logo just in case
  }
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace fbcdn.net links with static placeholders
  content = content.replace(/https:\/\/scontent[^"']+\.fbcdn\.net[^"']+/g, (match) => {
    if (match.includes('logo') || match.includes('200x200') || match.includes('108')) {
      return '/logo-icon.png'; // Will use public or just standard logo path if we fix imports later, but let's just use an unsplash logo placeholder for now to be safe and avoid compilation errors with imports.
    }
    return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80';
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  }
}

walkDir(srcDir);
console.log('Done.');
