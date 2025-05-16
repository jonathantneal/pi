import { createConfetti } from "./pi-battle-confetti.ts"
import { Levels } from "./pi-battle-levels.ts"

const $create = <T extends keyof HTMLElementTagNameMap>(name: T, props?: Partial<Record<keyof HTMLElementTagNameMap[T], unknown>>): HTMLElementTagNameMap[T] =>
	Object.assign(document.createElement(name), props)

const style = new CSSStyleSheet()

style.replaceSync(`:host {
	width: 5in;

	/* Behavior */
	-webkit-tap-highlight-color: transparent;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;
}

[part~="controls"] {
	display: flex;
	margin-block-start: 1rem;
	place-content: center;
}

[part~="name"] {
	font-family: "Press Start 2P";
	text-align: center;
}

[part~="grid"] {
	display: grid;

	/* Layout */
	grid-template-columns: repeat(var(--line, 0), 1fr);
	grid-template-rows: repeat(var(--line, 0), 1fr);
}

[part~="board"] {
	display: grid;
}

[part~="grid"],
[part~="canvas"] {
	grid-column: 1 / -1;
	grid-row: 1 / -1;
}

[part~="canvas"] {
	block-size: 100%;
	inline-size: 100%;
	z-index: 2;
	pointer-events: none;
}

[part~="cell"] {
	display: flex;

	/* Layout */
	aspect-ratio: 1 / 1;
	place-content: center;
	place-items: center;

	/* Text */
	font-size: max(0.2in);

	/* Appearance */
	border-radius: calc(1in / 16);
	box-shadow: var(--box-shadow);

	/* Behavior */
	-webkit-tap-highlight-color: transparent;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;

	/* Animation */
	transition: scale 400ms;

	/* Variable */
	--box-shadow: black 0 0 2px 1px inset,
		black -5px -6px 10px -4px inset;
}

[part~="cell"]:hover {
	scale: 1.05;
	box-shadow: var(--box-shadow), color-mix(in srgb, black 60%, transparent) 0 0 10px;
	z-index: 1;
}

[part~="mark"] {
	aspect-ratio: 1 / 1;
	width: -webkit-fill-available;
	height: -webkit-fill-available;
	margin: 12.5%;
	opacity: 0;
	scale: 1.125;
	transition: opacity 150ms ease-in-out, scale 600ms;
}

[part~="mark"][part~="selected"] {
	opacity: 1;
	scale: 1;
}

[part~="cell"][part~="nth-region-1"] {
	background-color: yellow;
}

[part~="cell"][part~="nth-region-1"][part~="active"] {
	color: black;
}

[part~="cell"][part~="nth-region-2"] {
	background-color: #7bd0ec;
}

[part~="cell"][part~="nth-region-2"][part~="active"] {
	color: black;
}

[part~="cell"][part~="nth-region-3"] {
	background-color: #4b4bd6;
}

[part~="cell"][part~="nth-region-4"] {
	background-color: red;
}

[part~="cell"][part~="nth-region-5"] {
	background-color: green;
}

[part~="cell"][part~="nth-region-6"] {
	background-color: #f5c6a2;
	background-color: #da008d;
}

[part~="cell"][part~="nth-region-7"] {
	background-color: aqua;
}

[part~="cell"][part~="nth-region-8"] {
	background-color: lime;
}

[part~="cell"][part~="nth-region-9"] {
	background-color: #ca58e0;
}
	
button {
	/* layout */
	padding: 0.25rem 2.5rem;

	/* typography */
	font: 700 100%/1.5 "Arial";
	text-shadow: 0 0 1px rgb(0 0 0 / 100%), 0 0 1px rgb(0 0 0 / 100%), 0 0 1px rgb(0 0 0 / 100%), 0 0 1px rgb(0 0 0 / 100%), 0 0 1px rgb(0 0 0 / 100%);

	/* appearance */
	background-color: var(--color);
	background-image: var(--background-image);
	background-repeat: no-repeat;
	color: White;
	border-radius: 0.0625rem;
	box-shadow: var(--box-shadow);
	background-position-x: -100%;

	/* interface */
	cursor: pointer;

	/* transformation */
	transform: skewX(calc(var(--skew) * 1deg));
	scale: var(--scale);

	/* animation */
	animation: var(--animation);
	transition: transform 0.15s, scale 0.15s, color 0.25s, box-shadow 0.25s;

	--animation: none;
	--color: rgb(145 50 200);
	--background-image: none;
	--skew: 0;
	--scale: 1;
	--box-shadow: var(--box-shadow-normal);
	--box-shadow-normal: rgba(0 0 0 / 50%) 0 0 4px, rgba(0, 0, 0, 0.2) 0 2px 4px inset, rgb(0 0 0 / 40%) 0 0 1px 1px inset;
	--box-shadow-hovered: rgb(250 130 245) 0 0 5px 5px;

	&:is(:hover, :focus, :active) {
		--animation: hover 0.25s, shine 3s infinite;
		--background-image: linear-gradient(to right, rgb(100% 100% 100% / 0%) 0%, rgb(100% 100% 100% / 33%) 50%, rgb(100% 100% 100% / 0%) 100%);
		--color: rgb(255 0 185);
		--skew: -10;
		--scale: 1.05;
	}

	&:is(:active) {
		--box-shadow: var(--box-shadow-normal), var(--box-shadow-hovered);
		--color: Red;
	}

	&:is(button) {
		border: 0;
	}

	& > span {
		display: block;

		/* transformation */
		transform: skewX(calc(var(--skew) * -1deg));

		/* animation */
		transition: transform 0.15s;
	}
}
	
@keyframes shine {
	0% {
		background-position-x: -10rem;
	}

	100% {
		background-position-x: 30rem;
	}
}

@keyframes hover {
	0% {
		scale: 1;
	}

	50% {
		scale: 1.10;
	}

	100% {
		scale: 1.05;
	}
}`)

export class PiBattleElement extends HTMLElement {
	grid: Cell[] = []
	levels = Levels
	levelIndex = 0
	isComplete = false
	numberOfRegions = 0

	shadowRoot: ShadowRoot = Object.assign(this.attachShadow({ mode: "open" }), {
		adoptedStyleSheets: [style],
	})

	confetti = {
		start() {},
		stop() {},
	}

	dom = {
		screen: $create("div", { part: "screen" }),
		name: $create("div", { part: "name" }),
		board: $create("div", { part: "board" }),
		grid: $create("div", { part: "grid" }),
		canvas: $create("canvas", { part: "canvas" }),
		controls: $create("div", { part: "controls" }),
		button: $create("button", { part: "button", innerHTML: "<span>New Battle</span>" }),
	}

	get currentLevel(): Levels.Level {
		return this.levels[this.levelIndex]!
	}

	getRow(index: number) {
		const level = this.currentLevel

		index = Number(index) || 0
		index = index % level.grid.length

		return this.grid.filter((cell) => cell.row === index)
	}

	constructor() {
		super()

		this.initializeShadowRoot()

		this.initializeGrid()
	}

	initializeShadowRoot() {
		this.dom.button.addEventListener("click", this.handleButtonClick)
		this.dom.board.append(this.dom.grid)
		this.dom.board.append(this.dom.canvas)
		this.dom.controls.append(this.dom.button)
		this.dom.screen.append(this.dom.name)
		this.dom.screen.append(this.dom.board)
		this.dom.screen.append(this.dom.controls)
		this.shadowRoot.append(this.dom.screen)
	}

	handleButtonClick = () => {
		this.isComplete = false

		for (const cell of this.grid) {
			cell.active = false
			cell.invalid = false
			cell.animation?.cancel()
		}

		this.confetti.stop()

		this.levelIndex = (this.levelIndex + 1) % this.levels.length

		this.initializeGrid()
	}

	initializeGrid() {
		const level = this.currentLevel
		const line = level.grid.length

		this.dom.name.textContent = level.name

		this.numberOfRegions = level.grid.reduce(
			(max, cols) =>
				Math.max(
					max,
					cols.reduce((max, col) => Math.max(max, col), 0),
				),
			0,
		)

		this.grid.splice(0)

		this.dom.grid.style.setProperty("grid-template-columns", `repeat(${line}, 1fr)`)
		this.dom.grid.style.setProperty("grid-template-rows", `repeat(${line}, 1fr)`)

		for (let row = 0; row < line; ++row) {
			for (let col = 0; col < line; ++col) {
				const index = row * line + col
				const region = level.grid[row]![col]!

				const nthRow = row + 1
				const nthCol = col + 1
				const nthRegion = region + 1

				const dom = {
					cell: $create("div", { part: `cell nth-row-${nthRow} nth-col-${nthCol} nth-region-${nthRegion}`, draggable: "false" }),
					mark: $create("img", { src: "pi.svg", alt: "selected", part: `mark nth-row-${nthRow} nth-col-${nthCol} nth-region-${nthRegion}` }),
				}

				dom.cell.append(dom.mark)

				dom.cell.dataset.cell = String(index)
				dom.cell.dataset.row = String(row)
				dom.cell.dataset.col = String(col)
				dom.cell.dataset.region = String(region)

				dom.cell.onclick = (event) => {
					event.preventDefault()

					if (this.isComplete) {
						return
					}

					cell.active = !cell.active

					dom.cell.part.toggle("selected", cell.active)
					dom.mark.part.toggle("selected", cell.active)

					this.validate()
				}

				const cell = {
					index,
					region,
					row,
					col,
					dom,
					active: false,
					invalid: false,
				}

				this.grid.push(cell)
			}
		}

		this.dom.grid.replaceChildren(...this.grid.map((cell) => cell.dom.cell))
	}

	validate() {
		const line = this.currentLevel.grid.length

		let activeLength = 0
		let invalidLength = 0

		for (const cell of this.grid) {
			cell.invalid = false
			cell.animation?.cancel()
		}

		for (let row = 0; row < line; ++row) {
			const rows = this.grid.filter((cell) => cell.row === row)
			const activeRows = rows.filter((cell) => cell.active)

			for (const cell of rows) {
				if (activeRows.length > 1 && !cell.invalid) {
					cell.invalid = true
					cell.animation = cell.dom.cell.animate(
						[
							{ offset: 0, translate: "0px 0" },
							{ offset: 0.2, translate: "-2px 0" },
							{ offset: 0.4, translate: "2px 0" },
							{ offset: 0.6, translate: "-2px 0" },
							{ offset: 0.8, translate: "1px 0" },
							{ offset: 1, translate: "0px 0" },
						],
						{
							duration: 200,
							iterations: Number.POSITIVE_INFINITY,
						},
					)
				}
			}
		}

		for (let col = 0; col < line; ++col) {
			const cells = this.grid.filter((cell) => cell.col === col)
			const activeRows = cells.filter((cell) => cell.active)

			for (const cell of cells) {
				if (activeRows.length > 1 && !cell.invalid) {
					cell.invalid = true

					cell.animation = cell.dom.cell.animate(
						[
							{ offset: 0, translate: "0 0" },
							{ offset: 0.2, translate: "0 -2px" },
							{ offset: 0.4, translate: "0 2px" },
							{ offset: 0.6, translate: "0 -2px" },
							{ offset: 0.8, translate: "0 1px" },
							{ offset: 1, translate: "0 0" },
						],
						{
							duration: 200,
							iterations: Number.POSITIVE_INFINITY,
						},
					)
				}
			}
		}

		for (let i = 0; i <= this.numberOfRegions; ++i) {
			const cells = this.grid.filter((cell) => cell.region === i)
			const activeRows = cells.filter((cell) => cell.active)

			for (const cell of cells) {
				if (activeRows.length > 1 && !cell.invalid) {
					cell.invalid = true

					cell.animation = cell.dom.cell.animate(
						[
							{ offset: 0, translate: "0 0" },
							{ offset: 0.2, translate: "0 -2px" },
							{ offset: 0.4, translate: "2px 0" },
							{ offset: 0.6, translate: "0 -2px" },
							{ offset: 0.8, translate: "1px 0" },
							{ offset: 1, translate: "0 0" },
						],
						{
							duration: 200,
							iterations: Number.POSITIVE_INFINITY,
						},
					)
				}
			}
		}

		// Diagonal adjacency check (upper-left, upper-right, lower-left, lower-right)
		for (const cell of this.grid) {
			if (!cell.active) continue

			const diagonals = [
				{ dr: -1, dc: -1 }, // upper-left
				{ dr: -1, dc: 1 }, // upper-right
				{ dr: 1, dc: -1 }, // lower-left
				{ dr: 1, dc: 1 }, // lower-right
			]

			for (const { dr, dc } of diagonals) {
				const neighbor = this.grid.find((other) => other.row === cell.row + dr && other.col === cell.col + dc && other.active)

				if (neighbor && !cell.invalid && !neighbor.invalid) {
					cell.invalid = true
					neighbor.invalid = true

					const animation = [
						{ offset: 0, translate: "0 0" },
						{ offset: 0.2, translate: "-2px -2px" },
						{ offset: 0.4, translate: "2px 2px" },
						{ offset: 0.6, translate: "-2px 2px" },
						{ offset: 0.8, translate: "2px -2px" },
						{ offset: 1, translate: "0 0" },
					]

					cell.animation = cell.dom.cell.animate(animation, {
						duration: 200,
						iterations: Number.POSITIVE_INFINITY,
					})

					neighbor.animation = neighbor.dom.cell.animate(animation, {
						duration: 200,
						iterations: Number.POSITIVE_INFINITY,
					})
				}
			}
		}

		for (const cell of this.grid) {
			if (cell.active) {
				++activeLength
			}

			if (cell.invalid) {
				++invalidLength
			}
		}

		if (activeLength === line && invalidLength === 0) {
			this.complete()
		}
	}

	async complete() {
		this.isComplete = true

		this.confetti = await createConfetti(this.dom.canvas)

		this.confetti.start()
	}
}

interface Cell {
	animation?: Animation
	active: boolean
	invalid: boolean
	index: number
	row: number
	col: number
	region: number
	dom: {
		cell: HTMLElement
		mark: HTMLElement
	}
}
