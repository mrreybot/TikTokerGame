/**
 * games/GameBase.js
 * 
 * Demonstrates:
 * - PL Concept 4: User-defined Types (GameBase Class).
 * - PL Elective Concept 2: Polymorphism (Base class defining interface contracts/abstract-like methods).
 * - PL Concept 1: Functions/Procedures (Re-usable canvas drawing procedures).
 */

export class GameBase {
    constructor(engine, onGameOverCallback) {
        // Run-time Validation (PL Concept 7)
        if (!engine) {
            throw new Error("GameBase requires an engine instance.");
        }
        if (typeof onGameOverCallback !== 'function') {
            throw new Error("GameBase requires a game over callback function.");
        }

        this.engine = engine;
        this.canvas = engine.canvas;
        this.onGameOver = onGameOverCallback;

        // Base states
        this.score = 0;
        this.isGameOver = false;
    }

    /**
     * Virtual Method: Initialize or reset game state.
     * Showcase: Polymorphism (To be overridden by subclasses).
     */
    init() {
        throw new Error("Abstract method 'init()' must be implemented by subclass.");
    }

    /**
     * Virtual Method: Update game calculations.
     * Showcase: Polymorphism (To be overridden by subclasses).
     */
    update(dt) {
        throw new Error("Abstract method 'update()' must be implemented by subclass.");
    }

    /**
     * Virtual Method: Render visual assets on screen.
     * Showcase: Polymorphism (To be overridden by subclasses).
     */
    render(ctx) {
        throw new Error("Abstract method 'render()' must be implemented by subclass.");
    }

    /**
     * Virtual Method: Handle input tap/click events mapped to canvas scale.
     * Showcase: Polymorphism (To be overridden by subclasses).
     */
    handleInput(x, y, event) {
        throw new Error("Abstract method 'handleInput()' must be implemented by subclass.");
    }

    /**
     * Helper Procedure: Draws a neon glowing rectangle.
     * Showcase: PL Concept 1 (Modular procedural abstraction).
     */
    drawNeonRect(ctx, x, y, w, h, fillColor, strokeColor, glowColor = '#fe2c55', glowBlur = 15) {
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowBlur;
        
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, w, h);
        }

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
        }
        ctx.restore();
    }

    /**
     * Helper Procedure: Draws a neon glowing circle.
     * Showcase: PL Concept 1.
     */
    drawNeonCircle(ctx, x, y, radius, fillColor, strokeColor, glowColor = '#25f4ee', glowBlur = 15) {
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowBlur;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Helper Procedure: Draws a text node with optional neon shadow.
     * Showcase: PL Concept 1.
     */
    drawNeonText(ctx, text, x, y, font = 'bold 20px Outfit, sans-serif', color = '#ffffff', align = 'center', glowColor = '#fe2c55', glowBlur = 8) {
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        
        if (glowColor) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = glowBlur;
        }

        ctx.fillText(text, x, y);
        ctx.restore();
    }
}
