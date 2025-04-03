"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SortingVisualizer from "./sorting-visualizer"
import PathfindingVisualizer from "./pathfinding-visualizer"

export default function AlgorithmVisualizer() {
  const [activeTab, setActiveTab] = useState("sorting")

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Tabs defaultValue="sorting" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
          <TabsTrigger value="pathfinding">Pathfinding</TabsTrigger>
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

