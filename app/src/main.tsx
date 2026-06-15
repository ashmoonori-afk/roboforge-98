import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '98.css/dist/98.css'
import './styles.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
