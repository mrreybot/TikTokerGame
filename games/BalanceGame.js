/**
 * games/BalanceGame.js
 * 
 * Demonstrates:
 * - PL Concept 4: User-defined Types (BalanceGame Class).
 * - PL Concept 6: Dynamic Data Structures (Uses the custom Stack class for stacked blocks).
 * - PL Concept 3: Dynamic Heap Allocation (Instantiating stack nodes, particles, and block objects).
 * - PL Elective Concept 2: Polymorphism (Overrides init, update, render, handleInput).
 * - PL Concept 1: Procedures (Draw functions, math calculations).
 * - Gravity Integration (Calls GameEngine.applyGravityPhysics).
 */

import { GameBase } from './GameBase.js';
import { Stack } from '../DataStructures.js';

export class BalanceGame extends GameBase {
    // Game States: 'SLIDING', 'DROPPING', 'TIPPING', 'GAMEOVER'
    #state = 'SLIDING';
    #blocksStack = null; // Custom Stack data structure storing placed blocks
    
    // Game dimensions
    #blockHeight = 35;
    #canvasHeight = 800;
    #canvasWidth = 400;

    // Active block attributes
    #activeBlock = null;
    #slideSpeed = 220; // pixels per second
    #slideDirection = 1; // 1 = Right, -1 = Left
    
    // Camera scroll tracking (to keep stack top visible)
    #cameraY = 0;
    #targetCameraY = 0;

    // Tipping animation state (PL Concept 3 heap storage)
    #tippedBlock = null;

    // TikTok styling colors array (PL Concept 2 Lexical/Module scope)
    #colors = ['#fe2c55', '#25f4ee', '#ff007f', '#00f5ff', '#ff00aa', '#00ffcc'];

    constructor(engine, onGameOverCallback) {
        super(engine, onGameOverCallback);
    }

    /**
     * Initialize/reset the Balance Stack game.
     * Showcase: Overridden virtual init method (Polymorphism).
     */
    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#state = 'SLIDING';
        this.#cameraY = 0;
        this.#targetCameraY = 0;
        this.#tippedBlock = null;

        // Dynamic heap allocation of the custom Stack structure (PL Concept 3/6)
        this.#blocksStack = new Stack();

        // Push the base foundation block onto the stack
        // Placed at the bottom (y = 700) with a wide base
        const baseBlock = {
            x: 100,
            y: 700,
            width: 200,
            color: '#121212',
            glowColor: '#ffffff'
        };
        this.#blocksStack.push(baseBlock);

        // Spawn first floating block
        this.#spawnActiveBlock();
    }

    /**
     * Spawns a new sliding block at the top of the viewport.
     */
    #spawnActiveBlock() {
        try {
            const topBlock = this.#blocksStack.peek();
            const colorIndex = this.score % this.#colors.length;

            // Instantiating a new block object in dynamic heap memory
            this.#activeBlock = {
                x: 0,
                y: 100, // Starts at top, will slide horizontally
                vy: 0,  // Initial vertical velocity
                width: topBlock.width,
                color: this.#colors[colorIndex],
                glowColor: this.#colors[colorIndex]
            };

            this.#state = 'SLIDING';

            // Increase sliding speed slightly as score increases to advance difficulty
            this.#slideSpeed = 220 + (this.score * 12);
        } catch (e) {
            // Exception handling (PL Concept 10)
            console.error("Failed to spawn active block. Stack peek failed.", e);
            this.onGameOver(this.score);
        }
    }

    /**
     * Coordinate Game updates.
     * Showcase: Overridden virtual update method (Polymorphism).
     */
    update(dt) {
        // Smooth camera scroll interpolation (PL Concept 1 Procedure)
        this.#cameraY += (this.#targetCameraY - this.#cameraY) * 0.1;

        if (this.#state === 'SLIDING') {
            this.#updateSlidingBlock(dt);
        } else if (this.#state === 'DROPPING') {
            this.#updateDroppingBlock(dt);
        } else if (this.#state === 'TIPPING') {
            this.#updateTippingBlock(dt);
        }
    }

    /**
     * Updates sliding animation back and forth.
     */
    #updateSlidingBlock(dt) {
        this.#activeBlock.x += this.#slideSpeed * this.#slideDirection * dt;
        
        // Reverse direction upon reaching boundaries
        const maxLeft = 0;
        const maxRight = this.#canvasWidth - this.#activeBlock.width;

        if (this.#activeBlock.x <= maxLeft) {
            this.#activeBlock.x = maxLeft;
            this.#slideDirection = 1;
        } else if (this.#activeBlock.x >= maxRight) {
            this.#activeBlock.x = maxRight;
            this.#slideDirection = -1;
        }
    }

    /**
     * Updates the dropping block under Custom Gravity.
     * Showcase: Custom Gravity physics integration.
     */
    #updateDroppingBlock(dt) {
        // Prepare state structure for physics integrator
        const physicsState = {
            y: this.#activeBlock.y,
            velocity: this.#activeBlock.vy,
            acceleration: 300 // Extra baseline engine acceleration
        };

        // Call the central manual physics equation integration (PL Concept 1)
        this.engine.applyGravityPhysics(physicsState, dt);

        // Map back integrated values
        this.#activeBlock.y = physicsState.y;
        this.#activeBlock.vy = physicsState.velocity;

        // Collision target level calculation (Top of stack)
        const topBlock = this.#blocksStack.peek();
        const targetY = topBlock.y - this.#blockHeight;

        if (this.#activeBlock.y >= targetY) {
            // Snap to exact stack height
            this.#activeBlock.y = targetY;
            this.#evaluatePlacement(topBlock);
        }
    }

    /**
     * Evaluates block alignment, slicing, and tipping conditions.
     */
    #evaluatePlacement(topBlock) {
        const active = this.#activeBlock;
        const activeLeft = active.x;
        const activeRight = active.x + active.width;
        const baseLeft = topBlock.x;
        const baseRight = topBlock.x + topBlock.width;

        // Overlap boundaries
        const overlapLeft = Math.max(activeLeft, baseLeft);
        const overlapRight = Math.min(activeRight, baseRight);
        const overlapWidth = overlapRight - overlapLeft;

        // Condition 1: Missed entirely
        if (overlapWidth <= 0) {
            this.#setupTippingAnimation(activeLeft < baseLeft ? 'LEFT' : 'RIGHT');
            return;
        }

        // Tipping Collision Algorithm (PL Concept 1: Procedural Logic)
        // If center of gravity of active block lands outside base bounds, it tips
        const activeCenter = activeLeft + active.width / 2;
        
        // Let's check if center is outside base or if overlap width is extremely thin (<15% of top width)
        const isOffBalance = (activeCenter < baseLeft) || (activeCenter > baseRight);
        const isTooNarrow = overlapWidth < topBlock.width * 0.15;

        if (isOffBalance || isTooNarrow) {
            // Apply tipping physics simulation
            this.#setupTippingAnimation(activeCenter < (baseLeft + baseRight) / 2 ? 'LEFT' : 'RIGHT');
            return;
        }

        // Condition 3: Landed successfully -> Clip block to overlap bounds
        const placedBlock = {
            x: overlapLeft,
            y: active.y,
            width: overlapWidth,
            color: active.color,
            glowColor: active.glowColor
        };

        // Push successfully placed block onto custom Stack (PL Concept 6)
        this.#blocksStack.push(placedBlock);
        this.score++;

        // Shift camera upwards if stack is high
        const stackHeight = this.#blocksStack.size;
        if (stackHeight > 5) {
            // Move camera down to keep stack top at height 500
            this.#targetCameraY = (stackHeight - 5) * this.#blockHeight;
        }

        // Spawn next block
        this.#spawnActiveBlock();
    }

    /**
     * Prepares tipping block state for custom rotation fall animation.
     */
    #setupTippingAnimation(direction) {
        this.#state = 'TIPPING';
        this.#tippedBlock = {
            ...this.#activeBlock,
            angle: 0,
            angularVelocity: direction === 'LEFT' ? -4 : 4,
            vx: direction === 'LEFT' ? -100 : 100,
            vy: -150 // Small pop up bounce
        };
    }

    /**
     * Custom tipping physics logic.
     * Showcase: Manual non-linear rotations.
     */
    #updateTippingBlock(dt) {
        const tipped = this.#tippedBlock;

        // Apply translation physics manually
        tipped.vy += this.engine.gravity * dt;
        tipped.x += tipped.vx * dt;
        tipped.y += tipped.vy * dt;
        
        // Spin block
        tipped.angle += tipped.angularVelocity * dt;

        // Game over when block leaves viewport
        if (tipped.y > this.#canvasHeight + 100) {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    /**
     * Draw Balance Stack elements.
     * Showcase: Overridden virtual render method (Polymorphism).
     */
    render(ctx) {
        // Draw grid lines for TikTok aesthetic styling
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.#canvasWidth; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.#canvasHeight);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        // Translate view by camera offset to follow stack upwards
        ctx.translate(0, this.#cameraY);

        // Render stack blocks from top to bottom
        // Showcase: Converting custom stack data structure into array for traversal (PL Concept 6)
        const blocks = this.#blocksStack.toArray();
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            
            // Neon glowing styling
            const strokeColor = i === 0 ? '#ffffff' : null;
            this.drawNeonRect(
                ctx, 
                block.x, 
                block.y, 
                block.width, 
                this.#blockHeight, 
                block.color, 
                strokeColor, 
                block.glowColor,
                i === 0 ? 18 : 6
            );
        }

        ctx.restore();

        // Render active sliding or dropping block
        if (this.#state === 'SLIDING' || this.#state === 'DROPPING') {
            this.drawNeonRect(
                ctx,
                this.#activeBlock.x,
                this.#activeBlock.y + this.#cameraY,
                this.#activeBlock.width,
                this.#blockHeight,
                this.#activeBlock.color,
                '#ffffff',
                this.#activeBlock.glowColor,
                20
            );
        }

        // Render tipping block rotation
        if (this.#state === 'TIPPING' && this.#tippedBlock) {
            const tipped = this.#tippedBlock;
            ctx.save();
            // Translate origin to block center to perform rotation
            ctx.translate(tipped.x + tipped.width / 2, tipped.y + this.#cameraY + this.#blockHeight / 2);
            ctx.rotate(tipped.angle);
            
            // Draw relative to center
            this.drawNeonRect(
                ctx,
                -tipped.width / 2,
                -this.#blockHeight / 2,
                tipped.width,
                this.#blockHeight,
                tipped.color,
                '#ffffff',
                tipped.glowColor,
                20
            );
            ctx.restore();
        }

        // Draw Score Overlay HUD (PL Concept 1: Procedures)
        this.drawNeonText(ctx, `SCORE: ${this.score}`, this.#canvasWidth / 2, 50, '900 28px Outfit, sans-serif', '#ffffff', 'center', '#fe2c55', 8);
        this.drawNeonText(ctx, "TAP TO DROP", this.#canvasWidth / 2, 85, '500 12px Outfit, sans-serif', 'rgba(255, 255, 255, 0.6)', 'center', null);

        // Showcase: Debug information detailing Stack height (Heap/Data Structure validation)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px Courier New';
        ctx.fillText(`Stack Heap Size: ${this.#blocksStack.size} nodes`, 10, 780);
    }

    /**
     * Input tap handler triggers drop.
     * Showcase: Polymorphic interface handleInput.
     */
    handleInput(x, y, event) {
        if (this.isGameOver || this.#state !== 'SLIDING') return;
        this.#state = 'DROPPING';
    }
}
