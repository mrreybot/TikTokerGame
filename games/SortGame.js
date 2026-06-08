/**
 * games/SortGame.js
 * 
 * Demonstrates:
 * - PL Concept 4: User-defined Types (SortGame Class).
 * - PL Concept 6: Dynamic Data Structures (Uses multiple custom Stack classes to represent test tubes).
 * - PL Concept 3: Dynamic Heap Allocation (Allocating colors and transfer actions on the heap).
 * - PL Concept 10: Exception Handling (Validating tube transfer legality via try-catch blocks and user-facing toasts).
 * - PL Concept 7: Runtime Type Validation (Validating pushed colors).
 * - PL Elective Concept 2: Polymorphism (Overrides init, update, render, handleInput).
 */

import { GameBase } from './GameBase.js';
import { Stack } from '../DataStructures.js';

export class SortGame extends GameBase {
    // Game elements
    #tubes = []; // Array of custom Stack instances representing test tubes
    #numTubes = 5;
    #tubeCapacity = 4;

    // Selection state
    #selectedTubeIndex = null;

    // Visual feedback items (PL Concept 3 heap storage)
    #errorMsg = "";
    #errorTimer = 0;
    #shakingTubeIndex = null;
    #shakingTimer = 0;

    // Tube placement coordinates
    #tubeWidth = 45;
    #tubeHeight = 160;
    #tubeCoords = [];

    // Colors list
    #colors = {
        'RED': '#fe2c55',
        'BLUE': '#25f4ee',
        'YELLOW': '#ffff00'
    };

    constructor(engine, onGameOverCallback) {
        super(engine, onGameOverCallback);
        this.#initCoordinates();
    }

    /**
     * Map physical coordinates for drawing 5 test tubes horizontally on the 400px canvas.
     */
    #initCoordinates() {
        const startX = 35;
        const spacingX = 70;
        const y = 300; // Positioned vertically in the middle

        for (let i = 0; i < this.#numTubes; i++) {
            this.#tubeCoords.push({
                x: startX + (i * spacingX),
                y: y,
                width: this.#tubeWidth,
                height: this.#tubeHeight
            });
        }
    }

    /**
     * Initialize/reset the Water Sort Puzzle game.
     * Showcase: Overridden virtual init method (Polymorphism).
     */
    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#selectedTubeIndex = null;
        this.#errorMsg = "";
        this.#errorTimer = 0;
        this.#shakingTubeIndex = null;
        this.#shakingTimer = 0;

        // Dynamic heap allocation: Instantiate 5 Stack containers (PL Concept 3/6)
        this.#tubes = [];
        for (let i = 0; i < this.#numTubes; i++) {
            this.#tubes.push(new Stack(this.#tubeCapacity));
        }

        // Color blocks pool (3 colors * 4 of each = 12 total items)
        const pool = [
            'RED', 'RED', 'RED', 'RED',
            'BLUE', 'BLUE', 'BLUE', 'BLUE',
            'YELLOW', 'YELLOW', 'YELLOW', 'YELLOW'
        ];

        // Shuffle the pool using standard Knuth shuffle
        // Showcase: PL Concept 2 Lexical block scopes
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = pool[i];
            pool[i] = pool[j];
            pool[j] = temp;
        }

        // Distribute colors into the first 3 tubes (leaving the remaining 2 empty)
        let poolIndex = 0;
        for (let t = 0; t < 3; t++) {
            for (let c = 0; c < this.#tubeCapacity; c++) {
                this.#tubes[t].push(pool[poolIndex++]);
            }
        }
    }

    /**
     * Updates SortGame animations.
     * Showcase: Overridden virtual update method (Polymorphism).
     */
    update(dt) {
        // Decrement visual error messages display timer
        if (this.#errorTimer > 0) {
            this.#errorTimer -= dt;
            if (this.#errorTimer <= 0) {
                this.#errorMsg = "";
            }
        }

        // Decrement tube shaking rejection animation timer
        if (this.#shakingTimer > 0) {
            this.#shakingTimer -= dt;
            if (this.#shakingTimer <= 0) {
                this.#shakingTubeIndex = null;
            }
        }
    }

    /**
     * Executes transfer logic inside try-catch.
     * Showcase: PL Concept 10 (Exception Handling).
     * 
     * @param {number} fromIndex 
     * @param {number} toIndex 
     */
    #attemptTransfer(fromIndex, toIndex) {
        // Exception Handling (PL Concept 10): Guard checking and throwing descriptive errors.
        try {
            const fromTube = this.#tubes[fromIndex];
            const toTube = this.#tubes[toIndex];

            // Rule 1: Cannot move to the same tube
            if (fromIndex === toIndex) {
                this.#selectedTubeIndex = null; // Simply deselect
                return;
            }

            // Rule 2: Cannot pour from an empty tube
            if (fromTube.isEmpty()) {
                throw new Error("Source tube is empty.");
            }

            // Rule 3: Cannot pour to a full tube
            if (toTube.size >= this.#tubeCapacity) {
                throw new Error("Destination tube is full!");
            }

            const movingColor = fromTube.peek();

            // Rule 4: Match color checks or allow pour if destination is empty
            if (!toTube.isEmpty()) {
                const targetColor = toTube.peek();
                if (movingColor !== targetColor) {
                    throw new Error("Colors do not match!");
                }
            }

            // Executing transaction: pop from source, push to destination
            const colorToMove = fromTube.pop();
            
            // Run-time Validation (PL Concept 7)
            if (!this.#colors[colorToMove]) {
                // If data was somehow corrupted, restore and fail
                fromTube.push(colorToMove);
                throw new TypeError(`Corrupt data type detected: ${colorToMove}`);
            }

            toTube.push(colorToMove);
            this.score++; // Track successful moves

            // Reset Selection
            this.#selectedTubeIndex = null;

            // Check if solved
            this.#checkWinCondition();

        } catch (error) {
            // Exception Handling (PL Concept 10): Capture thrown error and activate UI alerts
            this.#errorMsg = error.message;
            this.#errorTimer = 2.0; // Show for 2 seconds
            this.#shakingTubeIndex = fromIndex;
            this.#shakingTimer = 0.4; // Shake tube for 0.4 seconds
            this.#selectedTubeIndex = null; // Clear selection
            
            console.warn(`Move validation failed: ${error.message}`);
        }
    }

    /**
     * Check if all tubes are solved.
     */
    #checkWinCondition() {
        let completedTubesCount = 0;

        for (let i = 0; i < this.#numTubes; i++) {
            const tube = this.#tubes[i];
            
            // Tube is solved if it's either:
            // 1. Completely empty
            // 2. Completely full (4 items) and contains only 1 matching color
            if (tube.isEmpty()) {
                continue;
            }

            if (tube.size === this.#tubeCapacity) {
                const arr = tube.toArray();
                const firstColor = arr[0];
                const allMatch = arr.every(val => val === firstColor);
                if (allMatch) {
                    completedTubesCount++;
                }
            }
        }

        // We have 3 colors, so 3 completed tubes means win
        if (completedTubesCount === 3) {
            this.isGameOver = true;
            // High win score calculation
            const winBonus = Math.max(10, 100 - this.score);
            this.onGameOver(winBonus);
        }
    }

    /**
     * Render SortGame elements.
     * Showcase: Overridden virtual render method (Polymorphism).
     */
    render(ctx) {
        // Draw Game title HUD
        this.drawNeonText(ctx, "WATER SORT PUZZLE", 200, 50, '900 28px Outfit, sans-serif', '#ffffff', 'center', '#ffff00', 8);
        this.drawNeonText(ctx, `MOVES: ${this.score}`, 200, 85, '500 12px Outfit, sans-serif', 'rgba(255, 255, 255, 0.6)', 'center', null);

        // Draw the tubes
        for (let i = 0; i < this.#numTubes; i++) {
            const coords = this.#tubeCoords[i];
            const tube = this.#tubes[i];

            ctx.save();
            
            // Rejection shake animation offset calculations
            if (this.#shakingTubeIndex === i && this.#shakingTimer > 0) {
                const shakeOffset = Math.sin(performance.now() * 0.08) * 5;
                ctx.translate(shakeOffset, 0);
            }

            const isSelected = this.#selectedTubeIndex === i;

            // Highlight selected tube with cyan outline
            const strokeColor = isSelected ? '#25f4ee' : 'rgba(255, 255, 255, 0.2)';
            const glowColor = isSelected ? '#25f4ee' : null;

            // 1. Draw Glass tube container (U-shape look)
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            if (glowColor) {
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 15;
            }

            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
            ctx.lineTo(coords.x, coords.y + coords.height - 10);
            ctx.arc(coords.x + coords.width / 2, coords.y + coords.height - 10, coords.width / 2, Math.PI, 0, true);
            ctx.lineTo(coords.x + coords.width, coords.y);
            ctx.stroke();

            // 2. Draw liquid blocks inside the tube
            // Showcase: Converting custom LIFO stack to array for bottom-to-top rendering (PL Concept 6)
            // .toArray returns array with top-element at index 0, so we reverse it to draw bottom-first.
            const blocks = tube.toArray().reverse();
            const blockHeight = (coords.height - 20) / this.#tubeCapacity;

            for (let j = 0; j < blocks.length; j++) {
                const colorCode = this.#colors[blocks[j]];
                const blockY = coords.y + coords.height - 12 - ((j + 1) * blockHeight);
                const blockX = coords.x + 4;
                const blockW = coords.width - 8;

                // If this is the top block of a selected tube, draw it hovered slightly above the tube
                let hoverOffset = 0;
                if (isSelected && j === blocks.length - 1) {
                    hoverOffset = -25;
                }

                // Draw liquid capsule segment
                this.drawNeonRect(
                    ctx,
                    blockX,
                    blockY + hoverOffset,
                    blockW,
                    blockHeight - 4,
                    colorCode,
                    null,
                    colorCode,
                    8
                );
            }

            ctx.restore();
        }

        // Draw error messages toast notification (Exception feedback)
        if (this.#errorMsg) {
            ctx.save();
            ctx.fillStyle = 'rgba(254, 44, 85, 0.95)'; // Glowing TikTok red
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#fe2c55';
            ctx.shadowBlur = 12;

            // Draw rounded toast box
            const toastX = 50;
            const toastY = 520;
            const toastW = 300;
            const toastH = 45;
            
            ctx.beginPath();
            ctx.roundRect(toastX, toastY, toastW, toastH, 10);
            ctx.fill();
            ctx.stroke();

            // Draw error message text
            this.drawNeonText(ctx, this.#errorMsg, 200, 547, 'bold 13px Outfit, sans-serif', '#ffffff', 'center', null);
            ctx.restore();
        }

        // Hint HUD instruction
        this.drawNeonText(ctx, "TAP TUBE TO POP, TAP ANOTHER TO POUR", 200, 600, '600 11px Outfit, sans-serif', 'rgba(255, 255, 255, 0.4)', 'center', null);

        // Showcase Debug Info: Displays individual tube memory states
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px Courier New';
        let debugText = "Tubes size nodes: ";
        for (let i = 0; i < this.#numTubes; i++) {
            debugText += `[T${i}:${this.#tubes[i].size}] `;
        }
        ctx.fillText(debugText, 10, 780);
    }

    /**
     * Tap click handler selects/transfers.
     * Showcase: Polymorphic interface handleInput.
     */
    handleInput(x, y, event) {
        if (this.isGameOver) return;
        // Detect which tube the coordinates map into
        let clickedTubeIndex = null;

        for (let i = 0; i < this.#numTubes; i++) {
            const coords = this.#tubeCoords[i];
            
            // Broaden touch boundaries slightly for finger ease
            const minX = coords.x - 10;
            const maxX = coords.x + coords.width + 10;
            const minY = coords.y - 40;
            const maxY = coords.y + coords.height;

            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                clickedTubeIndex = i;
                break;
            }
        }

        if (clickedTubeIndex === null) {
            // Clicked outside, clear selection
            this.#selectedTubeIndex = null;
            return;
        }

        if (this.#selectedTubeIndex === null) {
            // First click: select source tube
            const targetTube = this.#tubes[clickedTubeIndex];
            if (!targetTube.isEmpty()) {
                this.#selectedTubeIndex = clickedTubeIndex;
            } else {
                // Flash alert trying to pop empty tube
                this.#errorMsg = "Cannot select empty tube!";
                this.#errorTimer = 1.5;
            }
        } else {
            // Second click: attempt pour transaction
            this.#attemptTransfer(this.#selectedTubeIndex, clickedTubeIndex);
        }
    }
}
