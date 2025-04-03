import AlgorithmVisualizer from "@/components/algorithm-visualizer"

export default function Home() {
  return (
    <main className="container mx-auto py-7 px-4">  
      <div className="flex items-center justify-center mb-3">  
      <img  
      src="/logo.png"   
      alt="Algovithm Logo"   
      className="h-12 mr-4" 
      />  
      <h1 className="text-3xl font-bold ">Algovithm</h1>  
      </div>  
      <AlgorithmVisualizer />  
    </main>  
  )
}

