<script setup lang="ts">
import { ref, computed } from 'vue'

type Cell = 'X' | 'O' | null

const HUMAN: Cell = 'X'
const CPU: Cell = 'O'

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
] as const

const board = ref<Cell[]>(Array(9).fill(null))
const isThinking = ref(false)

function checkWinner(cells: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a]
    }
  }
  return null
}

const winner = computed(() => checkWinner(board.value))
const isDraw = computed(
  () => !winner.value && board.value.every((cell) => cell !== null),
)
const gameOver = computed(() => winner.value !== null || isDraw.value)

const status = computed(() => {
  if (winner.value === HUMAN) return 'あなたの勝ちです！'
  if (winner.value === CPU) return 'CPUの勝ちです'
  if (isDraw.value) return '引き分けです'
  if (isThinking.value) return 'CPU思考中…'
  return 'あなたの番です（×）'
})

// ミニマックス法：CPU（O）は最善手を打つため理論上負けない
function minimax(cells: Cell[], player: Cell): { score: number; index: number | null } {
  const result = checkWinner(cells)
  if (result === CPU) return { score: 10, index: null }
  if (result === HUMAN) return { score: -10, index: null }
  if (cells.every((cell) => cell !== null)) return { score: 0, index: null }

  const empties = cells.reduce<number[]>((acc, cell, i) => {
    if (cell === null) acc.push(i)
    return acc
  }, [])

  let best = { score: player === CPU ? -Infinity : Infinity, index: empties[0] }

  for (const i of empties) {
    const next = cells.slice()
    next[i] = player
    const { score } = minimax(next, player === CPU ? HUMAN : CPU)

    if (player === CPU ? score > best.score : score < best.score) {
      best = { score, index: i }
    }
  }

  return best
}

function cpuMove() {
  isThinking.value = true
  window.setTimeout(() => {
    const { index } = minimax(board.value, CPU)
    if (index !== null) {
      board.value[index] = CPU
    }
    isThinking.value = false
  }, 400)
}

function handleClick(i: number) {
  if (board.value[i] || gameOver.value || isThinking.value) return
  board.value[i] = HUMAN
  if (!checkWinner(board.value) && !board.value.every((cell) => cell !== null)) {
    cpuMove()
  }
}

function reset() {
  board.value = Array(9).fill(null)
  isThinking.value = false
}
</script>

<template>
  <div class="game">
    <h1>三目並べ</h1>
    <p
      class="status"
      :class="{ win: winner === HUMAN, lose: winner === CPU, draw: isDraw }"
    >
      {{ status }}
    </p>
    <div class="board">
      <button
        v-for="(cell, i) in board"
        :key="i"
        type="button"
        class="cell"
        :class="{ x: cell === 'X', o: cell === 'O' }"
        :disabled="!!cell || gameOver || isThinking"
        @click="handleClick(i)"
      >
        {{ cell }}
      </button>
    </div>
    <button type="button" class="reset" @click="reset">もう一度あそぶ</button>
  </div>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.status {
  font-size: 1.25rem;
  min-height: 1.5em;
  color: var(--text-h, #f3f4f6);
}
.status.win {
  color: #4ade80;
}
.status.lose {
  color: #f87171;
}
.status.draw {
  color: #facc15;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 96px);
  grid-template-rows: repeat(3, 96px);
  gap: 8px;
}

.cell {
  font-size: 2.5rem;
  font-weight: 700;
  border: 2px solid var(--border, #444);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}
.cell:not(:disabled):hover {
  background: var(--accent-bg, rgba(170, 59, 255, 0.1));
}
.cell:disabled {
  cursor: default;
}
.cell.x {
  color: #60a5fa;
}
.cell.o {
  color: #f87171;
}

.reset {
  font: inherit;
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  background: var(--accent-bg, rgba(170, 59, 255, 0.15));
  color: var(--accent, #c084fc);
  cursor: pointer;
}
.reset:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
