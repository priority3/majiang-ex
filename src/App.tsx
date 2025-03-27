import { MajiangHand } from './components/MajiangHand'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">胡一把川麻</h1>
        <MajiangHand />
      </div>
    </div>
  )
}

export default App
