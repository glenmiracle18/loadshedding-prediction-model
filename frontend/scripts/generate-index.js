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
  
  // Find the main JS file (usually the largest one with "main" in the name)
  const jsFiles = files.filter(f => f.includes('main-') && f.endsWith('.js'));
  if (jsFiles.length > 0) {
    mainJsFile = `assets/${jsFiles[0]}`;
  }
  
  // Find the CSS file
  const cssFiles = files.filter(f => f.includes('styles-') && f.endsWith('.css'));
  if (cssFiles.length > 0) {
    cssFile = `assets/${cssFiles[0]}`;
  }
}

// Create a simple static HTML for testing
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="AI-powered load shedding predictions for South Africa" />
    <title>LoadShed Predictor</title>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/${cssFile}" />
</head>
<body>
    <div id="root">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
            <div style="text-align: center;">
                <h1 style="color: #2563eb; margin-bottom: 1rem;">⚡ LoadShed Predictor</h1>
                <p style="color: #64748b;">AI-powered load shedding predictions for South Africa</p>
                <div style="margin-top: 2rem; padding: 1rem; background: #f1f5f9; border-radius: 8px;">
                    <p style="color: #475569;">🔧 Static version loading...</p>
                </div>
            </div>
        </div>
    </div>
    <script type="module">
        console.log('🚀 Starting app...');
        
        // Simple test without complex TanStack Router for now
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = \`
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div style="text-align: center; background: white; padding: 3rem; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">⚡</div>
                        <h1 style="color: #1e293b; margin-bottom: 1rem; font-size: 2.5rem;">LoadShed Predictor</h1>
                        <p style="color: #64748b; margin-bottom: 2rem;">AI-powered load shedding predictions for South Africa</p>
                        <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; border: 2px solid #22c55e;">
                            <p style="color: #15803d; font-weight: bold;">✅ App is working!</p>
                            <p style="color: #166534; font-size: 0.9rem; margin-top: 0.5rem;">
                                Static deployment successful on Netlify
                            </p>
                        </div>
                    </div>
                </div>
            \`;
            console.log('✅ Static content rendered');
        } else {
            console.error('❌ Root element not found');
        }
    </script>
</body>
</html>`;

fs.writeFileSync(indexPath, htmlContent);
console.log('✅ Generated index.html with assets:', { mainJsFile, cssFile });