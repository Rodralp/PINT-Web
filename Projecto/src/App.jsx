import './css/App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import CriarConta from './criar'
import Entrar from './entrar'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/criar" element={<CriarConta />} />
        <Route path="/entrar" element={<Entrar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
