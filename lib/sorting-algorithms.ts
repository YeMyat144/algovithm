// Insertion Sort
export function insertionSort(arr: number[], animations: any[]) {
    const n = arr.length
    const arrCopy = [...arr]
  
    for (let i = 1; i < n; i++) {
      const key = arrCopy[i]
      let j = i - 1
  
      // Compare current element with previous elements
      animations.push({ type: "compare", indices: [i, j] })
  
      while (j >= 0 && arrCopy[j] > key) {
        // Mark comparison
        if (j > 0) {
          animations.push({ type: "compare", indices: [j, j - 1] })
        }
  
        // Swap elements
        animations.push({ type: "swap", indices: [j + 1, j] })
        arrCopy[j + 1] = arrCopy[j]
        animations.push({ type: "update", indices: [j + 1], values: [arrCopy[j]] })
  
        j--
      }
  
      // Place key in its correct position
      animations.push({ type: "swap", indices: [j + 1] })
      arrCopy[j + 1] = key
      animations.push({ type: "update", indices: [j + 1], values: [key] })
    }
  
    // Mark all elements as sorted
    for (let i = 0; i < n; i++) {
      animations.push({ type: "sorted", indices: [i] })
    }
  
    return arrCopy
  }
  
  // Merge Sort
  export function mergeSort(arr: number[], animations: any[]) {
    const arrCopy = [...arr]
    const aux = [...arr]
  
    mergeSortHelper(arrCopy, aux, 0, arrCopy.length - 1, animations)
  
    // Mark all elements as sorted
    for (let i = 0; i < arrCopy.length; i++) {
      animations.push({ type: "sorted", indices: [i] })
    }
  
    return arrCopy
  }
  
  function mergeSortHelper(arr: number[], aux: number[], left: number, right: number, animations: any[]) {
    if (left >= right) return
  
    const mid = Math.floor((left + right) / 2)
  
    mergeSortHelper(arr, aux, left, mid, animations)
    mergeSortHelper(arr, aux, mid + 1, right, animations)
  
    merge(arr, aux, left, mid, right, animations)
  }
  
  function merge(arr: number[], aux: number[], left: number, mid: number, right: number, animations: any[]) {
    // Copy elements to auxiliary array
    for (let i = left; i <= right; i++) {
      aux[i] = arr[i]
    }
  
    let i = left
    let j = mid + 1
    let k = left
  
    while (i <= mid && j <= right) {
      // Compare elements
      animations.push({ type: "compare", indices: [i, j] })
  
      if (aux[i] <= aux[j]) {
        // Update element
        animations.push({ type: "swap", indices: [k] })
        arr[k] = aux[i]
        animations.push({ type: "update", indices: [k], values: [aux[i]] })
        i++
      } else {
        // Update element
        animations.push({ type: "swap", indices: [k] })
        arr[k] = aux[j]
        animations.push({ type: "update", indices: [k], values: [aux[j]] })
        j++
      }
      k++
    }
  
    while (i <= mid) {
      // Update remaining elements from left subarray
      animations.push({ type: "swap", indices: [k] })
      arr[k] = aux[i]
      animations.push({ type: "update", indices: [k], values: [aux[i]] })
      i++
      k++
    }
  
    while (j <= right) {
      // Update remaining elements from right subarray
      animations.push({ type: "swap", indices: [k] })
      arr[k] = aux[j]
      animations.push({ type: "update", indices: [k], values: [aux[j]] })
      j++
      k++
    }
  }
  
  // Quick Sort
  export function quickSort(arr: number[], animations: any[]) {
    const arrCopy = [...arr]
  
    quickSortHelper(arrCopy, 0, arrCopy.length - 1, animations)
  
    // Mark all elements as sorted
    for (let i = 0; i < arrCopy.length; i++) {
      animations.push({ type: "sorted", indices: [i] })
    }
  
    return arrCopy
  }
  
  function quickSortHelper(arr: number[], low: number, high: number, animations: any[]) {
    if (low < high) {
      const pivotIndex = partition(arr, low, high, animations)
  
      quickSortHelper(arr, low, pivotIndex - 1, animations)
      quickSortHelper(arr, pivotIndex + 1, high, animations)
    }
  }
  
  function partition(arr: number[], low: number, high: number, animations: any[]) {
    const pivot = arr[high]
    let i = low - 1
  
    for (let j = low; j < high; j++) {
      // Compare with pivot
      animations.push({ type: "compare", indices: [j, high] })
  
      if (arr[j] <= pivot) {
        i++
  
        // Swap elements
        animations.push({ type: "swap", indices: [i, j] })
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        animations.push({ type: "update", indices: [i, j], values: [arr[i], arr[j]] })
      }
    }
  
    // Place pivot in its correct position
    animations.push({ type: "swap", indices: [i + 1, high] })
    ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    animations.push({ type: "update", indices: [i + 1, high], values: [arr[i + 1], arr[high]] })
  
    return i + 1
  }
  
  