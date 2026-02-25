/// <reference types="vinxi/types/client" />
import { StartClient } from '@tanstack/react-start/client'
import { getRouter } from '../src/router'

const router = getRouter()

export default function App() {
  return <StartClient router={router} />
}