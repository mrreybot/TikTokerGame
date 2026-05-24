/**
 * games/FallGame.js
 * 
 * Demonstrates:
 * - PL Concept 4: User-defined Types (FallGame Class).
 * - PL Concept 6: Dynamic Data Structures (Uses the custom Stack class to manage game lives).
 * - PL Concept 3: Dynamic Heap Allocation (Instantiating lives stack nodes, rings, and physics states).
 * - PL Concept 10: Exception Handling (Managing popped items from empty stack).
 * - PL Concept 2: Scope and Closures (lexical callbacks for particles, closures in timing systems).
 * - PL Elective Concept 2: Polymorphism (Overrides init, update, render, handleInput).
 * - Gravity Integration (Calls GameEngine.applyGravityPhysics).
 */

import { GameBase } from './GameBase.js';
import { Stack } from '../DataStructures.js';

export class FallGame extends GameBase {
    #livesStack = null; // Custom Stack data structure storing user life nodes
    
    // Physics Ball elements
    #ball = {
        x: 200,
        y: -30,
        vy: 0,
        radius: 14,
        color: '#25f4ee',
        glowColor: '#25f4ee'
    };

    // Shifting scoring zone/gate details
    #gate = {
        y: 500,
        height: 70,
        targetY: 500,
        width: 320,
        x: 40,
        color: '#fe2c55',
        glowColor: '#fe2c55'
    };

    // Game stats
    #timeElapsed = 0;
    #baseGravityBoost = 0;
    #maxFallY = 800;

    // Visual feedback items (PL Concept 3 heap allocations)
    #rippleRings = []; // Particle effect lists
    #shakeTimer = 0;
    #shakeMagnitude = 0;

    constructor(engine, onGameOverCallback) {
        super(engine, onGameOverCallback);
    }

    /**
     * Initialize/reset the Stop the Ball game.
     * Showcase: Overridden virtual init method (Polymorphism).
     */
    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#timeElapsed = 0;
        this.#baseGravityBoost = 0;
        this.#shakeTimer = 0;
        this.#rippleRings = [];

        // Reset the ball physics
        this.#resetBall();

        // Dynamic heap allocation of the custom Stack for player lives (PL Concept 3/6)
        this.#livesStack = new Stack(5); // max 5 lives
        
        // Push 3 life nodes representing Player Hearts
        this.#livesStack.push({ id: 1, color: '#fe2c55' });
        this.#livesStack.push({ id: 2, color: '#fe2c55' });
        this.#livesStack.push({ id: 3, color: '#fe2c55' });
    }

    /**
     * Resets the ball coordinates and velocity to the top.
     */
    #resetBall() {
        this.#ball.x = 200;
        this.#ball.y = 20;
        this.#ball.vy = 50; // Starting downward velocity
    }

    /**
     * Trigger a camera screen shake.
     */
    #triggerShake(duration = 0.25, magnitude = 8) {
        this.#shakeTimer = duration;
        this.#shakeMagnitude = magnitude;
    }

    /**
     * Deducts a life by popping from the dynamic stack.
     * Showcase: Exception Handling (PL Concept 10) in stack pops.
     */
    #deductLife() {
        this.#triggerShake(0.35, 12);
        
        try {
            // Pop the top node off our custom stack
            this.#livesStack.pop();
            
            // Check if user is out of lives
            if (this.#livesStack.isEmpty()) {
                this.isGameOver = true;
                this.onGameOver(this.score);
            } else {
                this.#resetBall();
            }
        } catch (error) {
            // Exception Handling (PL Concept 10)
            console.warn("Exception caught during life pop: ", error.message);
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    /**
     * Updates game mechanics.
     * Showcase: Overridden virtual update method (Polymorphism).
     */
    update(dt) {
        this.#timeElapsed += dt;

        // Screen Shake calculation
        if (this.#shakeTimer > 0) {
            this.#shakeTimer -= dt;
        }

        // Shifting scoring zone gate (Moves vertically with sinusoidal oscillation)
        // Showcase: PL Concept 2 (Lexical math values and closures)
        // The gate's vertical center oscillates between 440px and 620px
        this.#gate.y = 520 + Math.sin(this.#timeElapsed * 2.5) * 90;

        // Integrate ball physics using Custom Gravity physics accumulator
        const physicsState = {
            y: this.#ball.y,
            velocity: this.#ball.vy,
            acceleration: 400 + this.#baseGravityBoost // Gravity increases as score rises
        };

        // Manual kinematics updates inside Engine
        this.engine.applyGravityPhysics(physicsState, dt);

        this.#ball.y = physicsState.y;
        this.#ball.vy = physicsState.velocity;

        // Boundary check: If ball falls below viewport without click, pop a life
        if (this.#ball.y > this.#maxFallY) {
            this.#deductLife();
        }

        // Update ripple rings animations
        this.#updateRipples(dt);
    }

    /**
     * Manage ripple animations.
     */
    #updateRipples(dt) {
        // PL Concept 1 (Modular procedural iterations)
        for (let i = this.#rippleRings.length - 1; i >= 0; i--) {
            const ripple = this.#rippleRings[i];
            ripple.radius += ripple.speed * dt;
            ripple.alpha -= 2.0 * dt;

            // Remove expired ripples (heap optimization)
            if (ripple.alpha <= 0) {
                this.#rippleRings.splice(i, 1);
            }
        }
    }

    /**
     * Handle click/tap validation.
     */
    #checkTap() {
        const ballY = this.#ball.y;
        const gateMin = this.#gate.y;
        const gateMax = this.#gate.y + this.#gate.height;

        // Check if ball center resides inside gate borders
        if (ballY >= gateMin && ballY <= gateMax) {
            // Hit!
            this.score++;
            
            // Add visual ripple splash ring (dynamic heap allocation)
            this.#rippleRings.push({
                x: this.#ball.x,
                y: this.#ball.y,
                radius: this.#ball.radius,
                alpha: 1.0,
                speed: 180,
                color: '#25f4ee'
            });

            // Speed up next drop
            this.#baseGravityBoost += 100;
            this.#resetBall();
        } else {
            // Miss!
            this.#deductLife();
        }
    }

    /**
     * Render FallGame assets.
     * Showcase: Overridden virtual render method (Polymorphism).
     */
    render(ctx) {
        // Apply camera shake if timer active
        ctx.save();
        if (this.#shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * this.#shakeMagnitude;
            const dy = (Math.random() - 0.5) * this.#shakeMagnitude;
            ctx.translate(dx, dy);
        }

        // Draw shifting score gate zone
        // Showcase: PL Concept 1 Drawing Procedure
        this.drawNeonRect(
            ctx,
            this.#gate.x,
            this.#gate.y,
            this.#gate.width,
            this.#gate.height,
            'rgba(254, 44, 85, 0.1)',
            this.#gate.color,
            this.#gate.glowColor,
            12
        );

        // Draw targets markers inside the gate
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(this.#gate.x, this.#gate.y + this.#gate.height / 2);
        ctx.lineTo(this.#gate.x + this.#gate.width, this.#gate.y + this.#gate.height / 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw ball path indicator
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, 0);
        ctx.lineTo(200, 800);
        ctx.stroke();

        // Draw active falling ball
        this.drawNeonCircle(
            ctx,
            this.#ball.x,
            this.#ball.y,
            this.#ball.radius,
            this.#ball.color,
            '#ffffff',
            this.#ball.glowColor,
            18
        );

        // Draw ripple particles
        for (const ripple of this.#rippleRings) {
            ctx.save();
            ctx.strokeStyle = ripple.color;
            ctx.globalAlpha = Math.max(0, ripple.alpha);
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore(); // Restore context from camera shake translation

        // HUD Render
        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 50, '900 28px Outfit, sans-serif', '#ffffff', 'center', '#25f4ee', 8);
        this.drawNeonText(ctx, "TAP WHEN BALL IS IN THE ZONE", 200, 85, '500 12px Outfit, sans-serif', 'rgba(255, 255, 255, 0.6)', 'center', null);

        // Render Lives Stack (Draw glowing hearts)
        // Showcase: Traversing Stack memory nodes to render HUD icons
        const lives = this.#livesStack.toArray();
        const startX = 350;
        const spacingX = 22;
        for (let i = 0; i < lives.length; i++) {
            // Draw heart-like small neon circle
            this.drawNeonCircle(ctx, startX - (i * spacingX), 45, 7, '#fe2c55', '#ffffff', '#fe2c55', 8);
        }

        // Showcase Debug Info: Shows stack items count (Lives indicator validation)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px Courier New';
        ctx.fillText(`Lives Stack Size: ${this.#livesStack.size} nodes`, 10, 780);
    }

    /**
     * Input tap events handler.
     * Showcase: Polymorphic interface handleInput.
     */
    handleInput(x, y, event) {
        // Player taps to catch the ball inside shifting gate
        this.#checkTap();
    }
}
