/**
 * Engine.js
 * 
 * Demonstrates:
 * - PL Concept 1: Functions/Procedures (Modular decomposition of game loop, resize handlers).
 * - PL Concept 2: Scope and Environment (Lexical closures in requestAnimationFrame, block-scoped let/const).
 * - PL Concept 4: User-defined Types (GameEngine ES6 Class).
 * - PL Concept 5: Abstraction and Encapsulation (#private fields and clean public run APIs).
 * - PL Concept 8: Event-driven design (Responsive touch/click input delegation and translation).
 */

export class GameEngine {
    // Encapsulation (PL Concept 5): Private variables protecting core engine states.
    #canvas;
    #ctx;
    #lastTime = 0;
    #animationFrameId = null;
    #activeGame = null;
    #isRunning = false;

    // Custom Gravity Physics Accumulator (Theme & Physics requirement)
    // gravity: constant downward acceleration (pixels / second^2)
    #gravity = 1500; 

    constructor(canvasId) {
        // PL Concept 7: Type usage/validation
        this.#canvas = document.getElementById(canvasId);
        if (!this.#canvas) {
            throw new Error(`Canvas element with ID '${canvasId}' not found.`);
        }
        
        this.#ctx = this.#canvas.getContext('2d');
        if (!this.#ctx) {
            throw new Error("Could not acquire 2D context from canvas.");
        }

        // Initialize mobile view sizing
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Event-driven design (PL Concept 8): Register central click/touch listeners
        this.#setupInputListeners();
    }

    /**
     * Resizes the canvas to match a mobile-first vertical view.
     * Keeps internal resolution fixed at 400x800 to ensure consistent game coordinates.
     */
    resizeCanvas() {
        // Logical layout boundary (Aspect ratio 1:2)
        const logicalWidth = 400;
        const logicalHeight = 800;

        this.#canvas.width = logicalWidth;
        this.#canvas.height = logicalHeight;

        // Viewport calculations - fit screen nicely while preserving aspect ratio
        const parent = this.#canvas.parentElement;
        if (parent) {
            const parentWidth = parent.clientWidth;
            const parentHeight = parent.clientHeight;

            const scale = Math.min(parentWidth / logicalWidth, parentHeight / logicalHeight);

            // Apply scaling to the CSS style of canvas for rendering scale
            this.#canvas.style.width = `${logicalWidth * scale}px`;
            this.#canvas.style.height = `${logicalHeight * scale}px`;
        }
    }

    /**
     * Set up input delegation for clicks and touch events.
     * Translate client (X, Y) to canvas-relative coordinates (0 to 400, 0 to 800).
     */
    #setupInputListeners() {
        const handleInputEvent = (clientX, clientY, e) => {
            if (!this.#activeGame || !this.#isRunning) return;

            // Get canvas bounding client rectangle
            const rect = this.#canvas.getBoundingClientRect();

            // Coordinate translation (PL Concept 1: Procedure)
            // Maps screen space to internal game space (400x800)
            const x = (clientX - rect.left) * (this.#canvas.width / rect.width);
            const y = (clientY - rect.top) * (this.#canvas.height / rect.height);

            // Pass translated coordinates down to the active polymorphic game
            this.#activeGame.handleInput(x, y, e);
        };

        // Event-driven design (PL Concept 8)
        this.#canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleInputEvent(e.clientX, e.clientY, e);
        });

        this.#canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault(); // Stop double trigger on mobile
                const touch = e.touches[0];
                handleInputEvent(touch.clientX, touch.clientY, e);
            }
        }, { passive: false });
    }

    /**
     * Physics accumulator: Manually integrates kinematic equations of motion.
     * Showcase: Manual gravity physics accumulator calculations.
     * Formulas:
     *   velocity = velocity + acceleration * dt
     *   position = position + velocity * dt
     * 
     * @param {Object} state - Physical body state: { y, velocity, acceleration }
     * @param {number} dt - delta time in seconds
     */
    applyGravityPhysics(state, dt) {
        // Validate parameter structure (PL Concept 7)
        if (typeof state !== 'object' || state.y === undefined || state.velocity === undefined) {
            throw new TypeError("Invalid body state object passed to physics engine.");
        }

        const accel = state.acceleration !== undefined ? state.acceleration : 0;
        
        // Manual Euler-Cromer integration (PL Concept 1: Procedures)
        // 1. Accumulate velocity: v_new = v_prev + (accel + gravity) * dt
        state.velocity += (accel + this.#gravity) * dt;

        // 2. Accumulate displacement: y_new = y_prev + v_new * dt
        state.y += state.velocity * dt;
    }

    /**
     * Start running a specific game class.
     * Showcase: Polymorphism (can start any game inheriting from GameBase).
     */
    runGame(gameInstance) {
        this.stop(); // Stop any currently running loop
        this.#activeGame = gameInstance;
        this.#activeGame.init();
        this.#isRunning = true;
        this.#lastTime = performance.now();

        // PL Concept 2: Scope and Environment.
        // Closure: The requestAnimationFrame callback retains reference to the lexically enclosed scope.
        const loop = (timestamp) => {
            if (!this.#isRunning) return;

            // Calculate delta time in seconds
            let dt = (timestamp - this.#lastTime) / 1000;
            
            // Cap delta time to prevent large physics jumps (e.g. if page is unfocused)
            if (dt > 0.1) dt = 0.1;

            this.#lastTime = timestamp;

            // Main update & render execution
            this.#update(dt);
            this.#render();

            this.#animationFrameId = requestAnimationFrame(loop);
        };

        // Prime the loop
        this.#animationFrameId = requestAnimationFrame(loop);
    }

    /**
     * Stop the engine game loop.
     */
    stop() {
        this.#isRunning = false;
        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#animationFrameId = null;
        }
    }

    /**
     * Internal update dispatcher.
     */
    #update(dt) {
        if (this.#activeGame) {
            this.#activeGame.update(dt);
        }
    }

    /**
     * Internal render dispatcher.
     */
    #render() {
        // Clear canvas
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

        // Draw active game
        if (this.#activeGame) {
            this.#activeGame.render(this.#ctx);
        }
    }

    // Getters and Setters (PL Concept 5)
    get canvas() { return this.#canvas; }
    get ctx() { return this.#ctx; }
    get gravity() { return this.#gravity; }
    set gravity(value) {
        if (typeof value === 'number') this.#gravity = value;
    }
}
