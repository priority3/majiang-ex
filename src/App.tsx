import { MajiangHand } from './components/MajiangHand'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">四川麻将听牌生成器</h1>
        <MajiangHand />
      </div>
    </div>
  )
}

export default App
