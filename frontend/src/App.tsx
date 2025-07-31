import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ProofForm from './pages/ProofForm'
import ProofStatus from './pages/ProofStatus'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify" element={<ProofForm />} />
          <Route path="/status" element={<ProofStatus />} />
        </Routes>
      </main>
    </div>
  )
}

export default App 