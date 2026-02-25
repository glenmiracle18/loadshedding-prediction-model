import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname, '../dist/client');
const indexPath = path.join(clientDir, 'index.html');

// Ensure client directory exists
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}

// Find the main JS file (it has a hash in the name)
const assetsDir = path.join(clientDir, 'assets');
let mainJsFile = 'main.js';
let cssFile = 'styles.css';

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  
  // Find the main JS file - this is the primary app entry point
  const jsFiles = files.filter(f => f.includes('main-') && f.endsWith('.js'));
  if (jsFiles.length > 0) {
    mainJsFile = `assets/${jsFiles[0]}`;
    console.log('📦 Found main entry file:', mainJsFile);
  }
  
  // Find the CSS file
  const cssFiles = files.filter(f => f.includes('styles-') && f.endsWith('.css'));
  if (cssFiles.length > 0) {
    cssFile = `assets/${cssFiles[0]}`;
  }
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="AI-powered load shedding predictions for South Africa" />
    <title>LoadShed Predictor</title>
    <link rel="icon" href="/favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/${cssFile}" />
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/${mainJsFile}"></script>
</body>
</html>`;

fs.writeFileSync(indexPath, htmlContent);
console.log('✅ Generated index.html with assets:', { mainJsFile, cssFile });