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

    // Swipe & Transition States
    #activeNode = null;
    #onGameOverCallback = null;
    #onActiveGameChangedCallback = null;

    #swipeStartY = 0;
    #swipeStartX = 0;
    #swipeYOffset = 0;
    #isSwiping = false;
    #isSlidingTransition = false;
    #slideProgress = 0;
    #slideDirection = 0; // 1 = next, -1 = prev, 0 = snap back
    #slideDuration = 0.25; // seconds
    #slideTimeElapsed = 0;
    #startSwipeYOffset = 0;

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
     * Set up arcade swiping config.
     */
    setupArcade(activeNode, onGameOverCallback, onActiveGameChangedCallback) {
        this.#activeNode = activeNode;
        this.#onGameOverCallback = onGameOverCallback;
        this.#onActiveGameChangedCallback = onActiveGameChangedCallback;
        this.loadGameFromActiveNode();
    }

    /**
     * Load and run the game class described by the active list node.
     */
    loadGameFromActiveNode() {
        if (!this.#activeNode) return;
        const metadata = this.#activeNode.value;
        const GameClass = metadata.Class;

        // Instantiate the game polymorphic class dynamically in the heap
        const gameInstance = new GameClass(this, (score) => {
            this.#onGameOverCallback(score);
        });

        this.runGame(gameInstance);

        if (this.#onActiveGameChangedCallback) {
            this.#onActiveGameChangedCallback(metadata);
        }
    }

    /**
     * Set up input delegation for clicks, touch events, and vertical swipe gestures.
     */
    #setupInputListeners() {
        let isMouseDown = false;

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

        const onStart = (clientX, clientY) => {
            if (!this.#activeGame || !this.#isRunning || this.#isSlidingTransition) return;
            isMouseDown = true;
            this.#swipeStartY = clientY;
            this.#swipeStartX = clientX;
            this.#isSwiping = false;
            this.#swipeYOffset = 0;
        };

        const onMove = (clientX, clientY, e) => {
            if (!isMouseDown) return;
            const dy = clientY - this.#swipeStartY;
            const dx = clientX - this.#swipeStartX;

            // Start swipe vertical gesture if vertical drag > 15px and is predominantly vertical
            if (!this.#isSwiping && Math.abs(dy) > 15 && Math.abs(dy) > Math.abs(dx)) {
                this.#isSwiping = true;
            }

            if (this.#isSwiping) {
                this.#swipeYOffset = dy;
            }
        };

        const onEnd = (clientX, clientY, e) => {
            if (!isMouseDown) return;
            isMouseDown = false;

            if (this.#isSwiping) {
                const threshold = 100; // swipe displacement threshold (pixels)
                if (this.#swipeYOffset < -threshold && this.#activeNode) {
                    // Swipe UP -> Slide in NEXT game from bottom
                    this.#isSlidingTransition = true;
                    this.#slideDirection = 1;
                    this.#startSwipeYOffset = this.#swipeYOffset;
                    const progress = Math.abs(this.#swipeYOffset) / 800;
                    this.#slideTimeElapsed = progress * this.#slideDuration;
                } else if (this.#swipeYOffset > threshold && this.#activeNode) {
                    // Swipe DOWN -> Slide in PREV game from top
                    this.#isSlidingTransition = true;
                    this.#slideDirection = -1;
                    this.#startSwipeYOffset = this.#swipeYOffset;
                    const progress = Math.abs(this.#swipeYOffset) / 800;
                    this.#slideTimeElapsed = progress * this.#slideDuration;
                } else {
                    // Snap back
                    this.#isSlidingTransition = true;
                    this.#slideDirection = 0;
                    this.#startSwipeYOffset = this.#swipeYOffset;
                    const progress = Math.abs(this.#swipeYOffset) / 800;
                    this.#slideTimeElapsed = (1 - progress) * this.#slideDuration;
                }
                this.#isSwiping = false;
            } else {
                handleInputEvent(clientX, clientY, e);
            }
        };

        // Mouse listeners (globally on window for drag out support)
        this.#canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            onStart(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            onMove(e.clientX, e.clientY, e);
        });

        window.addEventListener('mouseup', (e) => {
            onEnd(e.clientX, e.clientY, e);
        });

        // Touch listeners (directly on canvas)
        this.#canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault();
                const touch = e.touches[0];
                onStart(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        this.#canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault();
                const touch = e.touches[0];
                onMove(touch.clientX, touch.clientY, e);
            }
        }, { passive: false });

        this.#canvas.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                e.preventDefault();
                const touch = e.changedTouches[0];
                onEnd(touch.clientX, touch.clientY, e);
            }
        });
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
        if (this.#isSlidingTransition) {
            this.#slideTimeElapsed += dt;
            const t = Math.min(1, this.#slideTimeElapsed / this.#slideDuration);
            const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
            const easeVal = easeOutCubic(t);

            if (this.#slideDirection === 1) {
                // Slide to next (target: -800)
                this.#swipeYOffset = this.#startSwipeYOffset + (-800 - this.#startSwipeYOffset) * easeVal;
            } else if (this.#slideDirection === -1) {
                // Slide to prev (target: 800)
                this.#swipeYOffset = this.#startSwipeYOffset + (800 - this.#startSwipeYOffset) * easeVal;
            } else {
                // Snap back (target: 0)
                this.#swipeYOffset = this.#startSwipeYOffset * (1 - easeVal);
            }

            if (t >= 1) {
                this.#isSlidingTransition = false;
                if (this.#slideDirection === 1 && this.#activeNode) {
                    this.#activeNode = this.#activeNode.next;
                    this.loadGameFromActiveNode();
                } else if (this.#slideDirection === -1 && this.#activeNode) {
                    this.#activeNode = this.#activeNode.prev;
                    this.loadGameFromActiveNode();
                }
                this.#swipeYOffset = 0;
            }
        } else if (this.#activeGame && !this.#isSwiping) {
            this.#activeGame.update(dt);
        }
    }

    /**
     * Internal render dispatcher.
     */
    #render() {
        // Clear canvas
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

        if (this.#isSwiping || this.#isSlidingTransition) {
            // Draw current active game translated
            this.#ctx.save();
            this.#ctx.translate(0, this.#swipeYOffset);
            if (this.#activeGame) {
                this.#activeGame.render(this.#ctx);
            }
            this.#ctx.restore();

            // Render sliding adjacent card previews
            if (this.#activeNode) {
                if (this.#swipeYOffset < 0) {
                    // Dragging UP -> Next game slides in from bottom
                    const nextVal = this.#activeNode.next.value;
                    this.drawPreviewCard(this.#ctx, nextVal.name, nextVal.icon, nextVal.color, this.#swipeYOffset + 800);
                } else if (this.#swipeYOffset > 0) {
                    // Dragging DOWN -> Previous game slides in from top
                    const prevVal = this.#activeNode.prev.value;
                    this.drawPreviewCard(this.#ctx, prevVal.name, prevVal.icon, prevVal.color, this.#swipeYOffset - 800);
                }
            }
        } else if (this.#activeGame) {
            this.#activeGame.render(this.#ctx);
        }
    }

    /**
     * Draw a premium neon card preview for upcoming circular game nodes.
     */
    drawPreviewCard(ctx, name, icon, color, yOffset) {
        ctx.save();
        ctx.translate(0, yOffset);

        // Dark background matching main viewport
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, 400, 800);

        // Subtle background grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 400; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 800); ctx.stroke();
        }
        for (let j = 0; j < 800; j += 40) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(400, j); ctx.stroke();
        }

        // Draw Card border
        const pad = 24;
        const rx = pad;
        const ry = pad;
        const rw = 400 - pad * 2;
        const rh = 800 - pad * 2;
        const radius = 24;

        ctx.beginPath();
        ctx.moveTo(rx + radius, ry);
        ctx.lineTo(rx + rw - radius, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
        ctx.lineTo(rx + rw, ry + rh - radius);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
        ctx.lineTo(rx + radius, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
        ctx.lineTo(rx, ry + radius);
        ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
        ctx.closePath();

        ctx.fillStyle = '#121218';
        ctx.fill();

        ctx.shadowColor = color || '#fe2c55';
        ctx.shadowBlur = 25;
        ctx.strokeStyle = color || '#fe2c55';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon Render
        ctx.shadowColor = color || '#fe2c55';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        ctx.font = '80px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon || '🎮', 200, 320);

        // Title text
        ctx.font = '900 28px Outfit, sans-serif';
        ctx.fillText(name.toUpperCase(), 200, 420);

        // Helper instruction text
        ctx.shadowBlur = 0;
        ctx.font = '800 11px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText("NEXT CHALLENGE", 200, 210);

        ctx.font = '800 13px Outfit, sans-serif';
        ctx.fillStyle = color || '#fe2c55';
        ctx.fillText("RELEASE TO LOAD", 200, 475);

        // Visual paging dots
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(180 + i * 20, 700, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Getters and Setters (PL Concept 5)
    get canvas() { return this.#canvas; }
    get ctx() { return this.#ctx; }
    get gravity() { return this.#gravity; }
    set gravity(value) {
        if (typeof value === 'number') this.#gravity = value;
    }
    get activeNode() { return this.#activeNode; }
    set activeNode(val) { this.#activeNode = val; }
    get activeGame() { return this.#activeGame; }
}

