import { createConfetti } from "./confetti.js"
import { Levels } from "./pi-battle-levels.js"

const confetti = createConfetti(document.documentElement)

const SIZE = 5

let levelIndex = Math.floor(Math.random() * Levels.length)
const cells = []

const board = document.getElementById("game-board")

document.getElementById("battle").onclick = () => {
	levelIndex = (levelIndex + 1) % Levels.length

	init()
	draw()
}

const init = () => {
	const Level = Levels[levelIndex]
	const REGIONS = Level.level
	const SIZE = REGIONS[0].length

	cells.splice(0)

	const fragment = new DocumentFragment()

	for (let row = 0; row < SIZE; row++) {
		for (let col = 0; col < SIZE; col++) {
			const cell = document.createElement("div")

			cell.dataset.row = row
			cell.dataset.col = col

			fragment.append(cell)

			cells.push(cell)
		}
	}

	board.replaceChildren(fragment)

	board.style.gridTemplateColumns = `repeat(${SIZE}, 50px)`
}

const draw = () => {
	const Level = Levels[levelIndex]
	const REGIONS = Level.level
	const SIZE = REGIONS[0].length

	document.querySelector("#game-name").textContent = Level.title

	let index = 0

	for (let row = 0; row < SIZE; row++) {
		for (let col = 0; col < SIZE; col++) {
			const cell = cells[index++]

			cell.className = `cell region-${REGIONS[row][col]}`
			cell.dataset.region = REGIONS[row][col]
			cell.textContent = ""
			cell.onclick = () => {
				cell.textContent = cell.textContent === "π" ? "" : "π"
			}
		}
	}
}

init()
draw()

document.getElementById("check").addEventListener("click", () => {
	const Level = Levels[levelIndex]
	const REGIONS = Level.level
	const SIZE = REGIONS[0].length

	const errors = []

	const rowCounts = Array(SIZE).fill(0)
	const colCounts = Array(SIZE).fill(0)
	const regionPis = new Map()

	// Count πs
	for (let i = 0; i < cells.length; ++i) {
		const cell = cells[i]
		const row = Number(cell.dataset.row)
		const col = Number(cell.dataset.col)
		const region = Number(cell.dataset.region)

		if (cell.textContent === "π") {
			++rowCounts[row]
			++colCounts[col]

			if (!regionPis.has(region)) regionPis.set(region, 0)
			regionPis.set(region, regionPis.get(region) + 1)
		}
	}

	// Check rows
	for (let i = 0; i < SIZE; ++i) {
		if (rowCounts[i] !== 1) {
			errors.push(`Row ${i + 1} has ${rowCounts[i]} πs`)
		}
	}

	// Check columns
	for (let i = 0; i < SIZE; ++i) {
		if (colCounts[i] !== 1) {
			errors.push(`Column ${i + 1} has ${colCounts[i]} πs`)
		}
	}

	// Check regions
	for (const [region, count] of regionPis) {
		if (count !== 1) {
			errors.push(`Region ${region} has ${count} πs`)
		}
	}

	// Validate touching πs
	for (let i = 0; i < cells.length; ++i) {
		if (cells[i].textContent !== "π") continue
		const r = Number(cells[i].dataset.row)
		const c = Number(cells[i].dataset.col)
		for (let dr = -1; dr <= 1; dr++) {
			for (let dc = -1; dc <= 1; dc++) {
				if (dr === 0 && dc === 0) continue
				const nr = r + dr
				const nc = c + dc
				if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
					const nIdx = nr * SIZE + nc
					if (cells[nIdx].textContent === "π") {
						errors.push(`π at (${r + 1}, ${c + 1}) touches another at (${nr + 1}, ${nc + 1})`)
					}
				}
			}
		}
	}

	if (errors.length > 0) {
		console.log(`Errors:\n${errors.join("\n")}`)
	} else {
		confetti.start()
	}
})
