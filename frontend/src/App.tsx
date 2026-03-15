import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Wizard } from './components/wizard/Wizard'
import { CharacterSheet } from './pages/CharacterSheet'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<Wizard />} />
        <Route path="/characters/:id" element={<CharacterSheet />} />
      </Routes>
    </BrowserRouter>
  )
}
