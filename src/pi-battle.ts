export { generateSolution }

const generateSolution = (regions: string[][], size: number) => {
	const solution = Array.from({ length: size }, () => Array(size).fill(""))
	const regionMap = new Map()

	// Group all cells by region
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			const regionId = regions[r]![c]

			if (!regionMap.has(regionId)) {
				regionMap.set(regionId, [])
			}

			regionMap.get(regionId).push([r, c])
		}
	}

	// Try placing one π per region
	const regionIds = [...regionMap.keys()]

	shuffle(regionIds)

	for (const regionId of regionIds) {
		const cells = regionMap.get(regionId)

		shuffle(cells)

		let placed = false

		for (const [r, c] of cells) {
			if (isValidPlacement(r, c, solution)) {
				solution[r]![c] = "π"

				placed = true

				break
			}
		}

		if (!placed) {
			// Failed: retry the whole thing
			return generateSolution(regions, size)
		}
	}

	return solution
}

export const isValidPlacement = (row: number, col: number, solution: string[][]): boolean => {
	const size = solution.length

	for (let dr = -1; dr <= 1; ++dr) {
		for (let dc = -1; dc <= 1; ++dc) {
			if (dr === 0 && dc === 0) {
				continue
			}

			const nr = row + dr
			const nc = col + dc

			if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
				if (solution[nr]![nc] === "π") {
					return false
				}
			}
		}
	}

	return true
}

/** Randomly shuffles the digits array in place using Fisher-Yates algorithm */
const shuffle = <T>(values: T[]): void => {
	for (let i = values.length - 1; i > 0; --i) {
		const j = Math.floor(Math.random() * (i + 1))

		// re-assign shuffled values
		;[values[i], values[j]] = [values[j]!, values[i]!]
	}
}
