"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react"
import { insertionSort, mergeSort, quickSort } from "@/lib/sorting-algorithms"

type ArrayBar = {
  value: number
  isComparing: boolean
  isSorted: boolean
  isSwapping: boolean
}

export default function SortingVisualizer() {
  const [array, setArray] = useState<ArrayBar[]>([])
  const [algorithm, setAlgorithm] = useState("insertion")
  const [speed, setSpeed] = useState([50])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [customInput, setCustomInput] = useState("")
  const [arraySize, setArraySize] = useState(20)

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationsRef = useRef<any[]>([])
  const currentStepRef = useRef(0)

  // Generate random array
  const generateRandomArray = (size: number) => {
    const newArray: ArrayBar[] = []
    for (let i = 0; i < size; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 100) + 5,
        isComparing: false,
        isSorted: false,
        isSwapping: false,
      })
    }
    setArray(newArray)
    resetAnimationState()
  }

  // Handle custom input
  const handleCustomInput = () => {
    try {
      const values = customInput
        .split(",")
        .map((val) => Number.parseInt(val.trim()))
        .filter((val) => !isNaN(val))

      if (values.length > 0) {
        const newArray: ArrayBar[] = values.map((value) => ({
          value,
          isComparing: false,
          isSorted: false,
          isSwapping: false,
        }))
        setArray(newArray)
        resetAnimationState()
      }
    } catch (error) {
      console.error("Invalid input format")
    }
  }

  // Reset animation state
  const resetAnimationState = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    animationsRef.current = []
    currentStepRef.current = 0
    setIsRunning(false)
    setIsPaused(false)
  }

  // Initialize with random array
  useEffect(() => {
    generateRandomArray(arraySize)
  }, [arraySize])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Start sorting
  const startSorting = () => {
    if (isRunning && isPaused) {
      setIsPaused(false)
      runAnimation()
      return
    }

    if (isRunning) return

    const arrayCopy = array.map((item) => ({ ...item, isComparing: false, isSorted: false, isSwapping: false }))
    const animations: any[] = []

    switch (algorithm) {
      case "insertion":
        insertionSort(
          arrayCopy.map((item) => item.value),
          animations,
        )
        break
      case "merge":
        mergeSort(
          arrayCopy.map((item) => item.value),
          animations,
        )
        break
      case "quick":
        quickSort(
          arrayCopy.map((item) => item.value),
          animations,
        )
        break
      default:
        return
    }

    animationsRef.current = animations
    currentStepRef.current = 0
    setIsRunning(true)
    runAnimation()
  }

  // Run animation step by step
  const runAnimation = () => {
    if (currentStepRef.current >= animationsRef.current.length) {
      // Mark all as sorted at the end
      setArray((prevArray) =>
        prevArray.map((item) => ({ ...item, isSorted: true, isComparing: false, isSwapping: false })),
      )
      setIsRunning(false)
      return
    }

    if (isPaused) return

    const animation = animationsRef.current[currentStepRef.current]
    const { type, indices, values } = animation

    setArray((prevArray) => {
      const newArray = prevArray.map((item, idx) => ({
        ...item,
        isComparing: false,
        isSwapping: false,
      }))

      if (type === "compare") {
        indices.forEach((index: number) => {
          if (index < newArray.length) {
            newArray[index] = { ...newArray[index], isComparing: true }
          }
        })
      } else if (type === "swap") {
        indices.forEach((index: number) => {
          if (index < newArray.length) {
            newArray[index] = { ...newArray[index], isSwapping: true }
          }
        })
      } else if (type === "update") {
        indices.forEach((index: number, i: number) => {
          if (index < newArray.length && i < values.length) {
            newArray[index] = {
              ...newArray[index],
              value: values[i],
              isSwapping: true,
            }
          }
        })
      } else if (type === "sorted") {
        indices.forEach((index: number) => {
          if (index < newArray.length) {
            newArray[index] = { ...newArray[index], isSorted: true }
          }
        })
      }

      return newArray
    })

    currentStepRef.current++

    // Calculate delay based on speed (invert the scale so higher value = faster)
    const delay = 1000 - speed[0] * 9

    animationTimeoutRef.current = setTimeout(runAnimation, delay)
  }

  // Pause animation
  const pauseAnimation = () => {
    setIsPaused(true)
  }

  // Reset animation
  const resetAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    setArray((prevArray) =>
      prevArray.map((item) => ({
        ...item,
        isComparing: false,
        isSorted: false,
        isSwapping: false,
      })),
    )

    currentStepRef.current = 0
    setIsRunning(false)
    setIsPaused(false)
  }

  // Step forward
  const stepForward = () => {
    if (!isRunning) {
      startSorting()
      setIsPaused(true)
      return
    }

    if (currentStepRef.current < animationsRef.current.length) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }

      const animation = animationsRef.current[currentStepRef.current]
      const { type, indices, values } = animation

      setArray((prevArray) => {
        const newArray = prevArray.map((item, idx) => ({
          ...item,
          isComparing: false,
          isSwapping: false,
        }))

        if (type === "compare") {
          indices.forEach((index: number) => {
            if (index < newArray.length) {
              newArray[index] = { ...newArray[index], isComparing: true }
            }
          })
        } else if (type === "swap") {
          indices.forEach((index: number) => {
            if (index < newArray.length) {
              newArray[index] = { ...newArray[index], isSwapping: true }
            }
          })
        } else if (type === "update") {
          indices.forEach((index: number, i: number) => {
            if (index < newArray.length && i < values.length) {
              newArray[index] = {
                ...newArray[index],
                value: values[i],
                isSwapping: true,
              }
            }
          })
        } else if (type === "sorted") {
          indices.forEach((index: number) => {
            if (index < newArray.length) {
              newArray[index] = { ...newArray[index], isSorted: true }
            }
          })
        }

        return newArray
      })

      currentStepRef.current++

      if (currentStepRef.current >= animationsRef.current.length) {
        // Mark all as sorted at the end
        setArray((prevArray) =>
          prevArray.map((item) => ({ ...item, isSorted: true, isComparing: false, isSwapping: false })),
        )
      }
    }
  }
  // Get max value for scaling
  const maxValue = Math.max(...array.map((item) => item.value))

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
              <SelectItem value="insertion">Insertion Sort</SelectItem>
              <SelectItem value="merge">Merge Sort</SelectItem>
              <SelectItem value="quick">Quick Sort</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="array-size" className="text-sm font-medium">
            Array Size
          </label>
          <div className="flex gap-2">
            <Input
              id="array-size"
              type="number"
              min="5"
              max="100"
              value={arraySize}
              onChange={(e) => setArraySize(Number.parseInt(e.target.value) || 20)}
              className="w-20"
            />
            <Button onClick={() => generateRandomArray(arraySize)}>Generate Random</Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="custom-input" className="text-sm font-medium">
            Custom Input
          </label>
          <div className="flex gap-2">
            <Input
              id="custom-input"
              placeholder="e.g., 5, 3, 8, 1, 2"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
            <Button onClick={handleCustomInput}>Apply</Button>
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
          <Button onClick={startSorting}>
            <Play className="mr-2 h-4 w-4" />
            {isPaused ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button onClick={pauseAnimation}>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        )}
        <Button onClick={resetAnimation}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={stepForward}>
          <SkipForward className="mr-2 h-4 w-4" />
          Step
        </Button>
      </div>

      <div className="h-64 flex items-end justify-center gap-1 border rounded-md p-4 bg-gray-50">
        {array.map((item, index) => (
          <div
            key={index}
            className={`w-full transition-all duration-200 ${
              item.isSorted
                ? "bg-green-500"
                : item.isComparing
                  ? "bg-yellow-500"
                  : item.isSwapping
                    ? "bg-red-500"
                    : "bg-blue-500"
            }`}
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              maxWidth: `${100 / array.length}%`,
              minWidth: "4px",
            }}
          ></div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Algorithm Description:</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          {algorithm === "insertion" && (
            <p>
              <strong>Insertion Sort:</strong> A simple sorting algorithm that builds the final sorted array one item at
              a time. It's efficient for small data sets and is often used as part of more sophisticated algorithms.
              Time Complexity: O(n²) in worst and average cases, O(n) in best case.
            </p>
          )}
          {algorithm === "merge" && (
            <p>
              <strong>Merge Sort:</strong> A divide-and-conquer algorithm that divides the input array into two halves,
              recursively sorts them, and then merges the sorted halves. Time Complexity: O(n log n) in all cases.
            </p>
          )}
          {algorithm === "quick" && (
            <p>
              <strong>Quick Sort:</strong> A divide-and-conquer algorithm that picks a 'pivot' element and partitions
              the array around it. It's typically faster in practice than other O(n log n) algorithms. Time Complexity:
              O(n²) in worst case, O(n log n) on average.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

