# Algorithm Visualizer

An interactive web application for visualizing sorting and pathfinding algorithms. This educational tool helps users understand how different algorithms work through step-by-step visual animations.

![Algorithm Visualizer Demo](https://i.ibb.co/hRmjwB00/Screenshot-2025-04-04-000608.png)

## Features

### Sorting Algorithms
- **Insertion Sort**: A simple sorting algorithm that builds the final sorted array one item at a time
- **Merge Sort**: A divide-and-conquer algorithm with O(n log n) time complexity
- **Quick Sort**: An efficient sorting algorithm that uses a pivot element for partitioning

### Pathfinding Algorithms
- **Dijkstra's Algorithm**: Guarantees the shortest path by visiting nodes with the smallest known distance first
- **A* Algorithm**: Uses a heuristic function to find paths more efficiently than Dijkstra's

### User Interface
- **Algorithm Selection**: Choose between different sorting and pathfinding algorithms
- **Visualization Controls**: Play, pause, reset, and step through algorithms
- **Speed Control**: Adjust the animation speed with a slider
- **Custom Input**: Enter your own data for sorting or create custom maze patterns for pathfinding
- **Interactive Grid**: Draw/erase walls, move start and end nodes, generate random obstacles

## Demo

Check out the live demo: [Algorithm Visualizer Demo](https://algorithmvizualizer.vercel.app/)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/algorithm-visualizer.git

# Navigate to the project directory
cd algorithm-visualizer

# Install dependencies
npm install

# Start the development server
npm run dev