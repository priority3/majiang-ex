import { MajiangHand } from './components/MajiangHand'
import { ParticleBackground } from './components/ParticleBackground'

function App() {
  return (
    <div className="min-h-screen w-full relative">
      {/* 粒子背景 */}
      <ParticleBackground count={40} />

      {/* 主内容区 */}
      <div className="container mx-auto py-8 px-4 relative z-10">
        <MajiangHand />
      </div>
    </div>
  )
}

export default App
