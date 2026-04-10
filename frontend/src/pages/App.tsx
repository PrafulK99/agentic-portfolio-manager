import { useState } from 'react'
import '../App.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header>
        <h1>Agentic Portfolio Manager</h1>
      </header>
      
      <main>
        <section className="hero">
          <h2>Welcome to Your Portfolio Dashboard</h2>
          <p>AI-powered portfolio analysis and management</p>
        </section>

        <section className="interactive">
          <button
            className="btn-primary"
            onClick={() => setCount((count) => count + 1)}
          >
            Counter: {count}
          </button>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 Agentic Portfolio Manager. All rights reserved.</p>
      </footer>
    </div>
  )
}
