/// <reference types="vinxi/types/client" />
import { createRoot } from 'react-dom/client'

// Simple test component to verify React mounting
function TestApp() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      fontFamily: 'system-ui',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'green', fontSize: '2rem' }}>
        ✅ React App is Working!
      </h1>
      <p>If you see this, React is mounting successfully.</p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2>Debug Info:</h2>
        <p>Location: {window.location.href}</p>
        <p>User Agent: {navigator.userAgent}</p>
        <p>Time: {new Date().toISOString()}</p>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')

if (rootElement) {
  console.log('🎯 Root element found, mounting React app...')
  const root = createRoot(rootElement)
  root.render(<TestApp />)
  console.log('✅ React app mounted successfully')
} else {
  console.error('❌ Root element not found!')
  document.body.innerHTML = '<h1 style="color: red;">ERROR: Root element not found!</h1>'
}