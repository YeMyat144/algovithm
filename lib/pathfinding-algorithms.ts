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

// Dijkstra's Algorithm
export function dijkstra(grid: NodeType[][], startNode: NodeType, endNode: NodeType): NodeType[] {
  const visitedNodesInOrder: NodeType[] = []
  startNode.distance = 0
  const unvisitedNodes = getAllNodes(grid)

  while (unvisitedNodes.length) {
    // Sort unvisited nodes by distance
    sortNodesByDistance(unvisitedNodes)

    // Get the closest node
    const closestNode = unvisitedNodes.shift()

    // If we encounter a wall, skip it
    if (closestNode && closestNode.isWall) continue

    // If the closest node has a distance of infinity, we're trapped
    if (closestNode && closestNode.distance === Number.POSITIVE_INFINITY) return visitedNodesInOrder

    // If the closest node is the end node, we're done
    if (closestNode && closestNode.isEnd) return visitedNodesInOrder

    // Otherwise, mark the node as visited and update its neighbors
    if (closestNode) {
      closestNode.isVisited = true
      visitedNodesInOrder.push(closestNode)
      updateUnvisitedNeighbors(closestNode, grid)
    }
  }

  return visitedNodesInOrder
}

// A* Algorithm
export function aStar(grid: NodeType[][], startNode: NodeType, endNode: NodeType): NodeType[] {
  const visitedNodesInOrder: NodeType[] = []
  const openSet: NodeType[] = [startNode]
  const closedSet: NodeType[] = []

  // Initialize start node
  startNode.gScore = 0
  startNode.hScore = heuristic(startNode, endNode)
  startNode.fScore = startNode.hScore

  while (openSet.length > 0) {
    // Sort open set by fScore
    sortNodesByFScore(openSet)

    // Get the node with the lowest fScore
    const current = openSet.shift()

    // If we've reached the end node, we're done
    if (current && current.isEnd) {
      visitedNodesInOrder.push(current)
      return visitedNodesInOrder
    }

    // Add current node to closed set
    if (current) {
      closedSet.push(current)
      current.isVisited = true
      visitedNodesInOrder.push(current)

      // Get neighbors
      const neighbors = getNeighbors(current, grid)

      for (const neighbor of neighbors) {
        // Skip walls and nodes in the closed set
        if (neighbor.isWall || closedSet.includes(neighbor)) continue

        // Calculate tentative gScore
        const tentativeGScore = (current.gScore || 0) + 1

        // If neighbor is not in open set, add it
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor)
        }
        // If this path to neighbor is worse than previous one, skip
        else if (tentativeGScore >= (neighbor.gScore || Number.POSITIVE_INFINITY)) {
          continue
        }

        // This path is the best so far, record it
        neighbor.previousNode = current
        neighbor.gScore = tentativeGScore
        neighbor.hScore = heuristic(neighbor, endNode)
        neighbor.fScore = neighbor.gScore + neighbor.hScore
      }
    }
  }

  return visitedNodesInOrder
}

// Helper Functions

// Get all nodes from grid
function getAllNodes(grid: NodeType[][]): NodeType[] {
  const nodes: NodeType[] = []
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node)
    }
  }
  return nodes
}

// Sort nodes by distance
function sortNodesByDistance(nodes: NodeType[]): void {
  nodes.sort((a, b) => a.distance - b.distance)
}

// Sort nodes by fScore
function sortNodesByFScore(nodes: NodeType[]): void {
  nodes.sort((a, b) => (a.fScore || Number.POSITIVE_INFINITY) - (b.fScore || Number.POSITIVE_INFINITY))
}

// Update unvisited neighbors
function updateUnvisitedNeighbors(node: NodeType, grid: NodeType[][]): void {
  const neighbors = getNeighbors(node, grid)
  for (const neighbor of neighbors) {
    neighbor.distance = node.distance + 1
    neighbor.previousNode = node
  }
}

// Get neighbors
function getNeighbors(node: NodeType, grid: NodeType[][]): NodeType[] {
  const neighbors: NodeType[] = []
  const { row, col } = node
  const numRows = grid.length
  const numCols = grid[0].length

  // Up
  if (row > 0) neighbors.push(grid[row - 1][col])
  // Right
  if (col < numCols - 1) neighbors.push(grid[row][col + 1])
  // Down
  if (row < numRows - 1) neighbors.push(grid[row + 1][col])
  // Left
  if (col > 0) neighbors.push(grid[row][col - 1])

  return neighbors.filter((neighbor) => !neighbor.isVisited)
}

// Heuristic function (Manhattan distance)
function heuristic(node: NodeType, endNode: NodeType): number {
  return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col)
}

