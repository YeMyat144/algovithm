"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SortingVisualizer from "./sorting-visualizer"
import PathfindingVisualizer from "./pathfinding-visualizer"

export default function AlgorithmVisualizer() {
  const [activeTab, setActiveTab] = useState("sorting")

  return (
    <div className="rounded-lg shadow-lg p-6 border border-primary/10">
      <Tabs defaultValue="sorting" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="sorting" className="data-[state=active]:bg-primary data-[state=active]:text-white">Sorting</TabsTrigger>
          <TabsTrigger value="pathfinding" className="data-[state=active]:bg-primary data-[state=active]:text-white">Pathfinding</TabsTrigger>
        </TabsList>
        <TabsContent value="sorting">
          <SortingVisualizer />
        </TabsContent>
        <TabsContent value="pathfinding">
          <PathfindingVisualizer />
        </TabsContent>
      </Tabs>
    </div>
  )
}

