const chart = document.getElementById('chart');
const algorithmSelect = document.getElementById('algorithmSelect');
const arraySizeInput = document.getElementById('arraySize');
const speedInput = document.getElementById('speed');
const randomizeBtn = document.getElementById('randomizeBtn');
const sortBtn = document.getElementById('sortBtn');
const statusEl = document.getElementById('status');

let values = [];
let isSorting = false;
let currentHighlights = { compare: [], swap: [], sorted: [] };

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateArray(size = Number(arraySizeInput.value)) {
  values = Array.from({ length: size }, () => randomInt(10, 90));
  currentHighlights = { compare: [], swap: [], sorted: [] };
  renderBars();
  statusEl.textContent = `Generated ${size} values.`;
}

function renderBars() {
  chart.innerHTML = '';

  values.forEach((value, index) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.title = `${value}`;
    bar.style.height = `${(value / 100) * 100}%`;

    if (currentHighlights.compare.includes(index)) {
      bar.classList.add('comparing');
    }
    if (currentHighlights.swap.includes(index)) {
      bar.classList.add('swapping');
    }
    if (currentHighlights.sorted.includes(index)) {
      bar.classList.add('sorted');
    }

    chart.appendChild(bar);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setStatus(message) {
  statusEl.textContent = message;
}

function updateHighlight({ compare = currentHighlights.compare, swap = currentHighlights.swap, sorted = currentHighlights.sorted } = {}) {
  currentHighlights = { compare, swap, sorted };
  renderBars();
}

function bubbleSort(array) {
  const actions = [];
  const n = array.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      actions.push({ type: 'compare', indices: [j, j + 1] });
      if (array[j] > array[j + 1]) {
        actions.push({ type: 'swap', indices: [j, j + 1] });
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
    actions.push({ type: 'sorted', indices: Array.from({ length: n - i }, (_, k) => n - 1 - k) });
  }

  return actions;
}

function insertionSort(array) {
  const actions = [];
  const n = array.length;

  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      actions.push({ type: 'compare', indices: [j - 1, j] });
      if (array[j - 1] <= array[j]) {
        break;
      }
      actions.push({ type: 'swap', indices: [j - 1, j] });
      [array[j - 1], array[j]] = [array[j], array[j - 1]];
      j--;
    }
    actions.push({ type: 'sorted', indices: Array.from({ length: i + 1 }, (_, k) => k) });
  }

  return actions;
}

function selectionSort(array) {
  const actions = [];
  const n = array.length;

  for (let i = 0; i < n; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      actions.push({ type: 'compare', indices: [minIndex, j] });
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      actions.push({ type: 'swap', indices: [i, minIndex] });
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
    }
    actions.push({ type: 'sorted', indices: Array.from({ length: i + 1 }, (_, k) => k) });
  }

  return actions;
}

function quickSortPartition(array, low, high, actions) {
  const pivotValue = array[high];
  let i = low;

  for (let j = low; j < high; j++) {
    actions.push({ type: 'compare', indices: [j, high] });
    if (array[j] <= pivotValue) {
      if (i !== j) {
        actions.push({ type: 'swap', indices: [i, j] });
        [array[i], array[j]] = [array[j], array[i]];
      }
      i++;
    }
  }

  if (i !== high) {
    actions.push({ type: 'swap', indices: [i, high] });
    [array[i], array[high]] = [array[high], array[i]];
  }

  actions.push({ type: 'sorted', indices: Array.from({ length: high + 1 }, (_, index) => index) });
  return i;
}

function quickSortRecursive(array, low, high, actions) {
  if (low >= high) return;

  const pivotIndex = quickSortPartition(array, low, high, actions);
  quickSortRecursive(array, low, pivotIndex - 1, actions);
  quickSortRecursive(array, pivotIndex + 1, high, actions);
}

function quickSort(array) {
  const actions = [];
  quickSortRecursive(array, 0, array.length - 1, actions);
  actions.push({ type: 'sorted', indices: Array.from({ length: array.length }, (_, index) => index) });
  return actions;
}

function mergeSortRecursive(array, left, right, actions) {
  if (left >= right) return;

  const middle = Math.floor((left + right) / 2);
  mergeSortRecursive(array, left, middle, actions);
  mergeSortRecursive(array, middle + 1, right, actions);

  const merged = [];
  let leftIndex = left;
  let rightIndex = middle + 1;

  while (leftIndex <= middle && rightIndex <= right) {
    actions.push({ type: 'compare', indices: [leftIndex, rightIndex] });
    if (array[leftIndex] <= array[rightIndex]) {
      merged.push(array[leftIndex]);
      leftIndex++;
    } else {
      merged.push(array[rightIndex]);
      rightIndex++;
    }
  }

  while (leftIndex <= middle) {
    merged.push(array[leftIndex]);
    leftIndex++;
  }

  while (rightIndex <= right) {
    merged.push(array[rightIndex]);
    rightIndex++;
  }

  for (let i = 0; i < merged.length; i++) {
    const actualIndex = left + i;
    actions.push({ type: 'assign', index: actualIndex, value: merged[i] });
    array[actualIndex] = merged[i];
  }

  actions.push({ type: 'sorted', indices: Array.from({ length: right + 1 }, (_, index) => index) });
}

function mergeSort(array) {
  const actions = [];
  mergeSortRecursive(array, 0, array.length - 1, actions);
  actions.push({ type: 'sorted', indices: Array.from({ length: array.length }, (_, index) => index) });
  return actions;
}

function heapify(array, length, rootIndex, actions) {
  let largestIndex = rootIndex;
  const left = 2 * rootIndex + 1;
  const right = 2 * rootIndex + 2;

  if (left < length && array[left] > array[largestIndex]) {
    largestIndex = left;
  }

  if (right < length && array[right] > array[largestIndex]) {
    largestIndex = right;
  }

  if (largestIndex !== rootIndex) {
    actions.push({ type: 'compare', indices: [rootIndex, largestIndex] });
    actions.push({ type: 'swap', indices: [rootIndex, largestIndex] });
    [array[rootIndex], array[largestIndex]] = [array[largestIndex], array[rootIndex]];
    heapify(array, length, largestIndex, actions);
  }
}

function heapSort(array) {
  const actions = [];
  const n = array.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(array, n, i, actions);
  }

  for (let end = n - 1; end > 0; end--) {
    actions.push({ type: 'compare', indices: [0, end] });
    actions.push({ type: 'swap', indices: [0, end] });
    [array[0], array[end]] = [array[end], array[0]];
    actions.push({ type: 'sorted', indices: Array.from({ length: n - end }, (_, index) => n - 1 - index) });
    heapify(array, end, 0, actions);
  }

  actions.push({ type: 'sorted', indices: Array.from({ length: array.length }, (_, index) => index) });
  return actions;
}

function playAnimation(steps) {
  currentHighlights = { compare: [], swap: [], sorted: [] };
  renderBars();

  return new Promise(async (resolve) => {
    for (const step of steps) {
      if (step.type === 'compare') {
        updateHighlight({ compare: step.indices, swap: [], sorted: currentHighlights.sorted });
      } else if (step.type === 'swap') {
        [values[step.indices[0]], values[step.indices[1]]] = [values[step.indices[1]], values[step.indices[0]]];
        updateHighlight({ compare: [], swap: step.indices, sorted: currentHighlights.sorted });
      } else if (step.type === 'assign') {
        values[step.index] = step.value;
        updateHighlight({ compare: [], swap: [], sorted: currentHighlights.sorted });
      } else if (step.type === 'sorted') {
        currentHighlights.sorted = step.indices;
        updateHighlight({ compare: [], swap: [], sorted: step.indices });
      }

      await sleep(Math.max(8, 120 - Number(speedInput.value) * 1.1));
    }

    updateHighlight({ compare: [], swap: [], sorted: Array.from({ length: values.length }, (_, index) => index) });
    resolve();
  });
}

function getAlgorithmSteps() {
  const algorithm = algorithmSelect.value;
  const workingValues = [...values];

  if (algorithm === 'bubble') return bubbleSort(workingValues);
  if (algorithm === 'insertion') return insertionSort(workingValues);
  if (algorithm === 'selection') return selectionSort(workingValues);
  if (algorithm === 'heap') return heapSort(workingValues);
  if (algorithm === 'merge') return mergeSort(workingValues);
  if (algorithm === 'quick') return quickSort(workingValues);

  return [];
}

async function startSorting() {
  if (isSorting) return;

  isSorting = true;
  sortBtn.disabled = true;
  randomizeBtn.disabled = true;
  arraySizeInput.disabled = true;
  algorithmSelect.disabled = true;

  setStatus('Sorting in progress...');

  const steps = getAlgorithmSteps();
  await playAnimation(steps);

  setStatus(`${algorithmSelect.options[algorithmSelect.selectedIndex].text} completed.`);
  isSorting = false;
  sortBtn.disabled = false;
  randomizeBtn.disabled = false;
  arraySizeInput.disabled = false;
  algorithmSelect.disabled = false;
}

randomizeBtn.addEventListener('click', () => {
  if (isSorting) return;
  generateArray();
});

arraySizeInput.addEventListener('input', () => {
  if (isSorting) return;
  generateArray(Number(arraySizeInput.value));
});

sortBtn.addEventListener('click', startSorting);

generateArray();
