import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
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
          <Route path="/proof" element={<ProofForm />} />
          <Route path="/status" element={<ProofStatus />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App 