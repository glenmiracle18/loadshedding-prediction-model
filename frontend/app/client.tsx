/// <reference types="vinxi/types/client" />
import { createRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import { getRouter } from '../src/router'

const router = getRouter()
const rootElement = document.getElementById('root')

if (rootElement) {
  const root = createRoot(rootElement)
  root.render(<StartClient router={router} />)
} else {
  console.error('Root element not found')
}