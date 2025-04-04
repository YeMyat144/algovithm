import AlgorithmVisualizer from "@/components/algorithm-visualizer"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4 min-h-screen bg-gradient-to-b from-black/5 to-transparent">  
      <div className="flex items-center justify-center mb-0">  
        <img  
          src="/logo1.png"   
          alt="Algovithm Logo"   
          className="h-16" 
        />  
      </div>  
      <AlgorithmVisualizer />  
    </main>  
  )
}

