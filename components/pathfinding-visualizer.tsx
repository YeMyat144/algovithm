"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react"
import { dijkstra, aStar } from "@/lib/pathfinding-algorithms"

type NodeType = {
  row: number
  col: number
  isStart: boolean
  isEnd: boolean
  isWall: boolean
  isVisited: boolean
  isPath: boolean
  distance: number
  previousNode: NodeType | null
  fScore?: number
  gScore?: number
  hScore?: number
}

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<NodeType[][]>([])
  const [algorithm, setAlgorithm] = useState("dijkstra")
  const [speed, setSpeed] = useState([50])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDrawingWalls, setIsDrawingWalls] = useState(false)
  const [isErasingWalls, setIsErasingWalls] = useState(false)
  const [isDraggingStart, setIsDraggingStart] = useState(false)
  const [isDraggingEnd, setIsDraggingEnd] = useState(false)

  const ROWS = 15
  const COLS = 25
  const START_NODE_ROW = 7
  const START_NODE_COL = 5
  const END_NODE_ROW = 7
  const END_NODE_COL = 20

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const visitedNodesInOrderRef = useRef<NodeType[]>([])
  const shortestPathNodesRef = useRef<NodeType[]>([])
  const currentStepRef = useRef(0)
  const animationPhaseRef = useRef<"visited" | "path">("visited")

  // Initialize grid
  const initializeGrid = () => {
    const newGrid: NodeType[][] = []

    for (let row = 0; row < ROWS; row++) {
      const currentRow: NodeType[] = []
      for (let col = 0; col < COLS; col++) {
        currentRow.push(createNode(row, col))
      }
      newGrid.push(currentRow)
    }

    return newGrid
  }

  // Create a node
  const createNode = (row: number, col: number): NodeType => {
    return {
      row,
      col,
      isStart: row === START_NODE_ROW && col === START_NODE_COL,
      isEnd: row === END_NODE_ROW && col === END_NODE_COL,
      isWall: false,
      isVisited: false,
      isPath: false,
      distance: Number.POSITIVE_INFINITY,
      previousNode: null,
    }
  }

  // Initialize on mount
  useEffect(() => {
    const initialGrid = initializeGrid()
    setGrid(initialGrid)
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Reset grid
  const resetGrid = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isVisited: false,
          isPath: false,
          distance: Number.POSITIVE_INFINITY,
          previousNode: null,
          fScore: undefined,
          gScore: undefined,
          hScore: undefined,
        })),
      )
      return newGrid
    })

    visitedNodesInOrderRef.current = []
    shortestPathNodesRef.current = []
    currentStepRef.current = 0
    animationPhaseRef.current = "visited"
    setIsRunning(false)
    setIsPaused(false)
  }

  // Clear walls
  const clearWalls = () => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isWall: false,
        })),
      )
      return newGrid
    })
  }

  // Generate random walls
  const generateRandomWalls = () => {
    resetGrid()

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((node) => {
          if (node.isStart || node.isEnd) return node
          return {
            ...node,
            isWall: Math.random() < 0.3, // 30% chance of being a wall
          }
        }),
      )
      return newGrid
    })
  }

  // Toggle wall
  const toggleWall = (row: number, col: number) => {
    if (isRunning) return

    const newGrid = [...grid]
    const node = newGrid[row][col]

    if (node.isStart || node.isEnd) return

    node.isWall = !node.isWall
    setGrid(newGrid)
  }

  // Handle mouse down on node
  const handleMouseDown = (row: number, col: number) => {
    if (isRunning) return

    const node = grid[row][col]

    if (node.isStart) {
      setIsDraggingStart(true)
      return
    }

    if (node.isEnd) {
      setIsDraggingEnd(true)
      return
    }

    if (node.isWall) {
      setIsErasingWalls(true)
    } else {
      setIsDrawingWalls(true)
    }

    toggleWall(row, col)
  }

  // Handle mouse enter on node
  const handleMouseEnter = (row: number, col: number) => {
    if (isRunning) return

    if (isDraggingStart) {
      moveStartNode(row, col)
      return
    }

    if (isDraggingEnd) {
      moveEndNode(row, col)
      return
    }

    if (isDrawingWalls || isErasingWalls) {
      const node = grid[row][col]
      if (node.isStart || node.isEnd) return

      const newGrid = [...grid]
      newGrid[row][col].isWall = isDrawingWalls
      setGrid(newGrid)
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDrawingWalls(false)
    setIsErasingWalls(false)
    setIsDraggingStart(false)
    setIsDraggingEnd(false)
  }

  // Move start node
  const moveStartNode = (newRow: number, newCol: number) => {
    if (grid[newRow][newCol].isEnd || grid[newRow][newCol].isWall) return

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isStart: node.row === newRow && node.col === newCol ? true : false,
        })),
      )
      return newGrid
    })
  }

  // Move end node
  const moveEndNode = (newRow: number, newCol: number) => {
    if (grid[newRow][newCol].isStart || grid[newRow][newCol].isWall) return

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isEnd: node.row === newRow && node.col === newCol ? true : false,
        })),
      )
      return newGrid
    })
  }

  // Get start and end nodes
  const getStartAndEndNodes = () => {
    let startNode: NodeType | null = null
    let endNode: NodeType | null = null

    for (const row of grid) {
      for (const node of row) {
        if (node.isStart) startNode = node
        if (node.isEnd) endNode = node
      }
    }

    return { startNode, endNode }
  }

  // Get grid with nodes
  const getGridWithNodes = () => {
    const nodes: NodeType[] = []
    const gridCopy = grid.map((row) => [...row])

    for (const row of gridCopy) {
      for (const node of row) {
        nodes.push({ ...node, previousNode: null })
      }
    }

    return { nodes, grid: gridCopy }
  }

  // Start visualization
  const startVisualization = () => {
    if (isRunning && isPaused) {
      setIsPaused(false)
      runAnimation()
      return
    }

    if (isRunning) return

    resetGrid()

    const { startNode, endNode } = getStartAndEndNodes()
    if (!startNode || !endNode) return

    const { nodes, grid: gridCopy } = getGridWithNodes()

    let visitedNodesInOrder: NodeType[] = []

    if (algorithm === "dijkstra") {
      visitedNodesInOrder = dijkstra(gridCopy, startNode, endNode)
    } else if (algorithm === "astar") {
      visitedNodesInOrder = aStar(gridCopy, startNode, endNode)
    }

    const shortestPathNodes = getShortestPath(endNode)

    visitedNodesInOrderRef.current = visitedNodesInOrder
    shortestPathNodesRef.current = shortestPathNodes
    currentStepRef.current = 0
    animationPhaseRef.current = "visited"

    setIsRunning(true)
    runAnimation()
  }

  // Get shortest path
  const getShortestPath = (endNode: NodeType) => {
    const shortestPath: NodeType[] = []
    let currentNode: NodeType | null = endNode

    while (currentNode) {
      shortestPath.unshift(currentNode)
      currentNode = currentNode.previousNode
    }

    return shortestPath
  }

  // Run animation
  const runAnimation = () => {
    if (isPaused) return

    if (animationPhaseRef.current === "visited") {
      if (currentStepRef.current >= visitedNodesInOrderRef.current.length) {
        animationPhaseRef.current = "path"
        currentStepRef.current = 0
        runAnimation()
        return
      }

      const node = visitedNodesInOrderRef.current[currentStepRef.current]

      setGrid((prevGrid) => {
        const newGrid = [...prevGrid]
        const gridNode = newGrid[node.row][node.col]

        if (!gridNode.isStart && !gridNode.isEnd) {
          gridNode.isVisited = true
        }

        return newGrid
      })

      currentStepRef.current++

      // Calculate delay based on speed (invert the scale so higher value = faster)
      const delay = 1000 - speed[0] * 9

      animationTimeoutRef.current = setTimeout(runAnimation, delay)
    } else if (animationPhaseRef.current === "path") {
      if (currentStepRef.current >= shortestPathNodesRef.current.length) {
        setIsRunning(false)
        return
      }

      const node = shortestPathNodesRef.current[currentStepRef.current]

      setGrid((prevGrid) => {
        const newGrid = [...prevGrid]
        const gridNode = newGrid[node.row][node.col]

        if (!gridNode.isStart && !gridNode.isEnd) {
          gridNode.isPath = true
        }

        return newGrid
      })

      currentStepRef.current++

      // Path animation is a bit faster
      const delay = (1000 - speed[0] * 9) / 2

      animationTimeoutRef.current = setTimeout(runAnimation, delay)
    }
  }

  // Pause animation
  const pauseAnimation = () => {
    setIsPaused(true)
  }

  // Step forward
  const stepForward = () => {
    if (!isRunning) {
      startVisualization()
      setIsPaused(true)
      return
    }

    if (isPaused) {
      if (animationPhaseRef.current === "visited") {
        if (currentStepRef.current < visitedNodesInOrderRef.current.length) {
          const node = visitedNodesInOrderRef.current[currentStepRef.current]

          setGrid((prevGrid) => {
            const newGrid = [...prevGrid]
            const gridNode = newGrid[node.row][node.col]

            if (!gridNode.isStart && !gridNode.isEnd) {
              gridNode.isVisited = true
            }

            return newGrid
          })

          currentStepRef.current++

          if (currentStepRef.current >= visitedNodesInOrderRef.current.length) {
            animationPhaseRef.current = "path"
            currentStepRef.current = 0
          }
        } else {
          animationPhaseRef.current = "path"
          currentStepRef.current = 0
          stepForward()
        }
      } else if (animationPhaseRef.current === "path") {
        if (currentStepRef.current < shortestPathNodesRef.current.length) {
          const node = shortestPathNodesRef.current[currentStepRef.current]

          setGrid((prevGrid) => {
            const newGrid = [...prevGrid]
            const gridNode = newGrid[node.row][node.col]

            if (!gridNode.isStart && !gridNode.isEnd) {
              gridNode.isPath = true
            }

            return newGrid
          })

          currentStepRef.current++
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col gap-2">
          <label htmlFor="algorithm" className="text-sm font-medium">
            Algorithm
          </label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger id="algorithm" className="w-[180px]">
              <SelectValue placeholder="Select Algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
              <SelectItem value="astar">A* Algorithm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Grid Options</label>
          <div className="flex gap-2">
            <Button onClick={clearWalls}>Clear Walls</Button>
            <Button onClick={generateRandomWalls}>Random Walls</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="speed" className="text-sm font-medium">
          Speed: {speed[0]}%
        </label>
        <Slider id="speed" min={1} max={100} step={1} value={speed} onValueChange={setSpeed} />
      </div>

      <div className="flex gap-2 justify-center">
        {!isRunning || isPaused ? (
          <Button onClick={startVisualization}>
            <Play className="mr-2 h-4 w-4" />
            {isPaused ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button onClick={pauseAnimation}>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        )}
        <Button onClick={resetGrid}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={stepForward}>
          <SkipForward className="mr-2 h-4 w-4" />
          Step
        </Button>
      </div>

      <div
        className="grid border rounded-md p-1 mx-auto"
        style={{
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        }}
        onMouseLeave={handleMouseUp}
      >
        {grid.map((row, rowIdx) =>
          row.map((node, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`w-6 h-6 transition-colors duration-200 ${
                node.isStart
                  ? "bg-green-500"
                  : node.isEnd
                    ? "bg-red-500"
                    : node.isPath
                      ? "bg-yellow-400"
                      : node.isVisited
                        ? "bg-blue-300"
                        : node.isWall
                          ? "bg-gray-800"
                          : "bg-white"
              } border border-gray-200`}
              onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
              onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
              onMouseUp={handleMouseUp}
            ></div>
          )),
        )}
      </div>

      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500"></div>
          <span>Start Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500"></div>
          <span>End Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800"></div>
          <span>Wall</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-300"></div>
          <span>Visited Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400"></div>
          <span>Path Node</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="p-4 rounded-md">
          {algorithm === "dijkstra" && (
            <p>
              <strong>Dijkstra's Algorithm:</strong> A weighted graph search algorithm that finds the shortest path
              between nodes. It guarantees the shortest path and works by visiting the nodes with the smallest known
              distance first. Time Complexity: O(V²) or O(E + V log V) with a priority queue.
            </p>
          )}
          {algorithm === "astar" && (
            <p>
              <strong>A* Algorithm:</strong> An informed search algorithm that uses a heuristic function to guide its
              search. It combines Dijkstra's algorithm (which favors vertices close to the starting point) with a greedy
              Best-First-Search (which favors vertices close to the goal). Time Complexity: O(E) in the worst case, but
              typically much faster in practice due to the heuristic.
            </p>
          )}
        </div>
      </div>

      
    </div>
  )
}

