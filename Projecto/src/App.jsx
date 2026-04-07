import './css/App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import CriarConta from './criar'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/criar" element={<CriarConta />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
