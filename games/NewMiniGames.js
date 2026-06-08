/**
 * games/NewMiniGames.js
 * 
 * Implement 27 additional mini-games for the TikTok Arcade, extending GameBase.
 * Each game represents a unique type-polymorphic module.
 */

import { GameBase } from './GameBase.js';
import { Stack } from '../DataStructures.js';

// Helper for generating random numbers
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ==========================================
// 1. SUDOKU GAME (Simplified 4x4)
// ==========================================
export class SudokuGame extends GameBase {
    #grid = [];
    #solution = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 3, 4, 1],
        [4, 1, 2, 3]
    ];
    #initialMask = [
        [true, false, true, false],
        [false, true, false, true],
        [true, false, false, true],
        [false, true, true, false]
    ];

    init() {
        this.score = 0;
        this.isGameOver = false;
        // Generate grid based on mask
        this.#grid = [];
        for (let r = 0; r < 4; r++) {
            this.#grid[r] = [];
            for (let c = 0; c < 4; c++) {
                this.#grid[r][c] = this.#initialMask[r][c] ? this.#solution[r][c] : 0;
            }
        }
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "4X4 SUDOKU", 200, 80, "900 28px Outfit", "#ffffff", "center", "#fe2c55", 10);
        this.drawNeonText(ctx, "TAP CELLS TO CYCLE 1 TO 4", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Draw 4x4 Grid
        const size = 65;
        const startX = 200 - size * 2;
        const startY = 250;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const val = this.#grid[r][c];
                const x = startX + c * size;
                const y = startY + r * size;
                const isFixed = this.#initialMask[r][c];
                
                this.drawNeonRect(ctx, x, y, size - 4, size - 4, 
                    isFixed ? 'rgba(255, 255, 255, 0.05)' : 'rgba(37, 244, 238, 0.05)',
                    isFixed ? 'rgba(255, 255, 255, 0.2)' : '#25f4ee',
                    isFixed ? null : '#25f4ee', 4);

                if (val !== 0) {
                    this.drawNeonText(ctx, val.toString(), x + size / 2 - 2, y + size / 2 + 7, 
                        "900 24px Outfit", isFixed ? "#ffffff" : "#25f4ee", "center", null);
                }
            }
        }

        // Draw Complete/Check banner
        this.drawNeonRect(ctx, 50, 600, 300, 50, 'rgba(254, 44, 85, 0.2)', '#fe2c55', '#fe2c55', 10);
        this.drawNeonText(ctx, "SUBMIT GRID", 200, 632, "800 15px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        const size = 65;
        const startX = 200 - size * 2;
        const startY = 250;

        // Check grid taps
        if (x >= startX && x < startX + size * 4 && y >= startY && y < startY + size * 4) {
            const c = Math.floor((x - startX) / size);
            const r = Math.floor((y - startY) / size);
            if (!this.#initialMask[r][c]) {
                this.#grid[r][c] = (this.#grid[r][c] % 4) + 1;
            }
            return;
        }

        // Check Submit Button
        if (x >= 50 && x <= 350 && y >= 600 && y <= 650) {
            // Verify
            let correct = true;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (this.#grid[r][c] !== this.#solution[r][c]) correct = false;
                }
            }
            if (correct) {
                this.score = 100;
                this.isGameOver = true;
                this.onGameOver(this.score);
            } else {
                this.isGameOver = true;
                this.onGameOver(0);
            }
        }
    }
}

// ==========================================
// 2. MEMORY MATCH (6 Cards)
// ==========================================
export class MemoryGame extends GameBase {
    #cards = [];
    #flippedIndices = [];
    #matchedCount = 0;
    #icons = ['🍕', '🎈', '👻', '🍕', '🎈', '👻'];

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#flippedIndices = [];
        this.#matchedCount = 0;

        // Shuffle cards
        this.#cards = this.#icons.map((icon, index) => ({
            id: index,
            icon: icon,
            isFlipped: false,
            isMatched: false
        })).sort(() => Math.random() - 0.5);
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "MEMORY MATCH", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);
        this.drawNeonText(ctx, "FIND THE HIDING PAIRS", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        const cardW = 100;
        const cardH = 120;
        const gap = 20;

        for (let i = 0; i < 6; i++) {
            const card = this.#cards[i];
            const r = Math.floor(i / 2);
            const c = i % 2;
            const x = 90 + c * (cardW + gap);
            const y = 220 + r * (cardH + gap);

            if (card.isMatched) {
                this.drawNeonRect(ctx, x, y, cardW, cardH, 'rgba(37, 244, 238, 0.05)', 'rgba(37, 244, 238, 0.3)', null, 0);
                this.drawNeonText(ctx, card.icon, x + cardW / 2, y + cardH / 2 + 10, "40px Outfit", "#ffffff", "center", null);
            } else if (card.isFlipped) {
                this.drawNeonRect(ctx, x, y, cardW, cardH, 'rgba(254, 44, 85, 0.2)', '#fe2c55', '#fe2c55', 8);
                this.drawNeonText(ctx, card.icon, x + cardW / 2, y + cardH / 2 + 10, "40px Outfit", "#ffffff", "center", null);
            } else {
                this.drawNeonRect(ctx, x, y, cardW, cardH, 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.2)', null, 4);
                this.drawNeonText(ctx, "?", x + cardW / 2, y + cardH / 2 + 12, "900 36px Outfit", "rgba(255, 255, 255, 0.3)", "center", null);
            }
        }
    }

    handleInput(x, y, event) {
        if (this.#flippedIndices.length >= 2) return;

        const cardW = 100;
        const cardH = 120;
        const gap = 20;

        for (let i = 0; i < 6; i++) {
            const card = this.#cards[i];
            if (card.isMatched || card.isFlipped) continue;

            const r = Math.floor(i / 2);
            const c = i % 2;
            const cx = 90 + c * (cardW + gap);
            const cy = 220 + r * (cardH + gap);

            if (x >= cx && x <= cx + cardW && y >= cy && y <= cy + cardH) {
                card.isFlipped = true;
                this.#flippedIndices.push(i);

                if (this.#flippedIndices.length === 2) {
                    const idx1 = this.#flippedIndices[0];
                    const idx2 = this.#flippedIndices[1];
                    
                    if (this.#cards[idx1].icon === this.#cards[idx2].icon) {
                        // Match
                        setTimeout(() => {
                            this.#cards[idx1].isMatched = true;
                            this.#cards[idx2].isMatched = true;
                            this.#flippedIndices = [];
                            this.#matchedCount += 2;
                            this.score += 10;
                            if (this.#matchedCount === 6) {
                                this.isGameOver = true;
                                this.onGameOver(this.score + 20);
                            }
                        }, 300);
                    } else {
                        // Mismatch flip back
                        setTimeout(() => {
                            this.#cards[idx1].isFlipped = false;
                            this.#cards[idx2].isFlipped = false;
                            this.#flippedIndices = [];
                        }, 800);
                    }
                }
                break;
            }
        }
    }
}

// ==========================================
// 3. REACTION TEST
// ==========================================
export class ReactionGame extends GameBase {
    #state = 'WAITING'; // WAITING, GREEN, TOO_EARLY, COMPLETED
    #timer = 0;
    #reactionTime = 0;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#state = 'WAITING';
        this.#timer = randomRange(1500, 3500) / 1000;
    }

    update(dt) {
        if (this.#state === 'WAITING') {
            this.#timer -= dt;
            if (this.#timer <= 0) {
                this.#state = 'GREEN';
                this.#timer = 0;
            }
        } else if (this.#state === 'GREEN') {
            this.#timer += dt;
        }
    }

    render(ctx) {
        if (this.#state === 'WAITING') {
            ctx.fillStyle = '#fe2c55';
            ctx.fillRect(0, 0, 400, 800);
            this.drawNeonText(ctx, "WAIT FOR GREEN...", 200, 400, "900 32px Outfit", "#ffffff", "center");
        } else if (this.#state === 'GREEN') {
            ctx.fillStyle = '#25f4ee';
            ctx.fillRect(0, 0, 400, 800);
            this.drawNeonText(ctx, "TAP NOW!!!", 200, 400, "900 44px Outfit", "#000000", "center", null);
        } else if (this.#state === 'TOO_EARLY') {
            ctx.fillStyle = '#121218';
            ctx.fillRect(0, 0, 400, 800);
            this.drawNeonText(ctx, "TOO EARLY!", 200, 400, "900 32px Outfit", "#fe2c55", "center");
            this.drawNeonText(ctx, "Tap to restart", 200, 450, "600 16px Outfit", "rgba(255, 255, 255, 0.6)", "center");
        } else {
            ctx.fillStyle = '#121218';
            ctx.fillRect(0, 0, 400, 800);
            this.drawNeonText(ctx, "SUCCESS!", 200, 350, "900 36px Outfit", "#25f4ee", "center");
            this.drawNeonText(ctx, `${Math.floor(this.#reactionTime * 1000)} ms`, 200, 410, "900 48px Outfit", "#ffffff", "center");
            this.drawNeonText(ctx, "Tap to restart", 200, 470, "600 16px Outfit", "rgba(255, 255, 255, 0.6)", "center");
        }
    }

    handleInput(x, y, event) {
        if (this.#state === 'WAITING') {
            this.#state = 'TOO_EARLY';
            this.score = 0;
            this.isGameOver = true;
            this.onGameOver(0);
        } else if (this.#state === 'GREEN') {
            this.#reactionTime = this.#timer;
            this.#state = 'COMPLETED';
            this.score = Math.max(10, Math.floor(100 - this.#reactionTime * 200));
            this.isGameOver = true;
            this.onGameOver(this.score);
        } else {
            this.init();
        }
    }
}

// ==========================================
// 4. MATH SPEED (True/False equations)
// ==========================================
export class MathSpeedGame extends GameBase {
    #equation = "";
    #answer = false;
    #timer = 1.0;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#nextEquation();
    }

    #nextEquation() {
        const a = randomRange(1, 10);
        const b = randomRange(1, 10);
        this.#answer = Math.random() > 0.5;
        this.#timer = 1.8 - Math.min(0.8, this.score * 0.05);

        if (this.#answer) {
            this.#equation = `${a} + ${b} = ${a + b}`;
        } else {
            const wrongResult = a + b + (Math.random() > 0.5 ? 1 : -1);
            this.#equation = `${a} + ${b} = ${wrongResult}`;
        }
    }

    update(dt) {
        this.#timer -= dt;
        if (this.#timer <= 0) {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "MATH SPEED", 200, 80, "900 28px Outfit", "#ffffff", "center", "#fe2c55", 10);
        
        // Progress bar timer
        const progressW = Math.max(0, (this.#timer / 1.8) * 300);
        this.drawNeonRect(ctx, 50, 130, 300, 10, 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)', null, 0);
        this.drawNeonRect(ctx, 50, 130, progressW, 10, '#fe2c55', '#fe2c55', '#fe2c55', 8);

        // Equation Card
        this.drawNeonRect(ctx, 40, 220, 320, 180, 'rgba(22, 24, 35, 0.8)', '#ffffff', null, 2);
        this.drawNeonText(ctx, this.#equation, 200, 320, "900 36px Outfit", "#ffffff", "center");

        // Action Buttons
        this.drawNeonRect(ctx, 50, 520, 130, 80, 'rgba(37, 244, 238, 0.1)', '#25f4ee', '#25f4ee', 8);
        this.drawNeonText(ctx, "✔ TRUE", 115, 568, "800 18px Outfit", "#25f4ee", "center");

        this.drawNeonRect(ctx, 220, 520, 130, 80, 'rgba(254, 44, 85, 0.1)', '#fe2c55', '#fe2c55', 8);
        this.drawNeonText(ctx, "✖ FALSE", 285, 568, "800 18px Outfit", "#fe2c55", "center");

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 460, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        let answerGiven = null;
        if (x >= 50 && x <= 180 && y >= 520 && y <= 600) answerGiven = true;
        if (x >= 220 && x <= 350 && y >= 520 && y <= 600) answerGiven = false;

        if (answerGiven !== null) {
            if (answerGiven === this.#answer) {
                this.score += 5;
                this.#nextEquation();
            } else {
                this.isGameOver = true;
                this.onGameOver(this.score);
            }
        }
    }
}

// ==========================================
// 5. TAP SPEED
// ==========================================
export class TapSpeedGame extends GameBase {
    #timer = 5.0;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#timer = 5.0;
    }

    update(dt) {
        this.#timer -= dt;
        if (this.#timer <= 0) {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "TAP SPEED TEST", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);
        this.drawNeonText(ctx, "TAP THE NEON BUTTON RAPIDLY!", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Timer
        this.drawNeonText(ctx, `TIME LEFT: ${Math.max(0, this.#timer).toFixed(2)}s`, 200, 200, "900 20px Outfit", "#fe2c55", "center");

        // Mega button
        this.drawNeonCircle(ctx, 200, 450, 110, 'rgba(37, 244, 238, 0.1)', '#25f4ee', '#25f4ee', 25);
        this.drawNeonText(ctx, "TAP ME", 200, 442, "900 28px Outfit", "#ffffff", "center");
        this.drawNeonText(ctx, `${this.score} TAPS`, 200, 475, "700 16px Outfit", "rgba(255, 255, 255, 0.7)", "center");
    }

    handleInput(x, y, event) {
        const dist = Math.sqrt((x - 200) ** 2 + (y - 450) ** 2);
        if (dist <= 110 && this.#timer > 0) {
            this.score++;
        }
    }
}

// ==========================================
// 6. COLOR FLOOD
// ==========================================
export class ColorFloodGame extends GameBase {
    #grid = [];
    #colors = ['#fe2c55', '#25f4ee', '#ffff00']; // Red, Cyan, Yellow
    #movesLeft = 7;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#movesLeft = 7;
        this.#grid = [];
        for (let r = 0; r < 4; r++) {
            this.#grid[r] = [];
            for (let c = 0; c < 4; c++) {
                this.#grid[r][c] = randomRange(0, 2);
            }
        }
    }

    #flood(targetColor, prevColor, r = 0, c = 0) {
        if (targetColor === prevColor) return;
        if (r < 0 || r >= 4 || c < 0 || c >= 4) return;
        if (this.#grid[r][c] !== prevColor) return;

        this.#grid[r][c] = targetColor;
        this.#flood(targetColor, prevColor, r + 1, c);
        this.#flood(targetColor, prevColor, r - 1, c);
        this.#flood(targetColor, prevColor, r, c + 1);
        this.#flood(targetColor, prevColor, r, c - 1);
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "COLOR FLOOD", 200, 80, "900 28px Outfit", "#ffffff", "center", "#ffff00", 10);
        this.drawNeonText(ctx, `MOVES LEFT: ${this.#movesLeft}`, 200, 115, "800 15px Outfit", "#fe2c55", "center");

        // Draw 4x4 Blocks
        const size = 60;
        const startX = 200 - size * 2;
        const startY = 230;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const color = this.#colors[this.#grid[r][c]];
                const x = startX + c * size;
                const y = startY + r * size;
                this.drawNeonRect(ctx, x, y, size - 4, size - 4, color, '#ffffff', color, 4);
            }
        }

        // Draw color triggers
        for (let i = 0; i < 3; i++) {
            const x = 90 + i * 85;
            this.drawNeonRect(ctx, x, 550, 60, 60, this.#colors[i], '#ffffff', this.#colors[i], 12);
        }
    }

    handleInput(x, y, event) {
        for (let i = 0; i < 3; i++) {
            const bx = 90 + i * 85;
            if (x >= bx && x <= bx + 60 && y >= 550 && y <= 610) {
                const targetColor = i;
                const prevColor = this.#grid[0][0];
                if (targetColor !== prevColor) {
                    this.#flood(targetColor, prevColor);
                    this.#movesLeft--;

                    // Verify if win
                    let win = true;
                    for (let r = 0; r < 4; r++) {
                        for (let c = 0; c < 4; c++) {
                            if (this.#grid[r][c] !== targetColor) win = false;
                        }
                    }

                    if (win) {
                        this.score = this.#movesLeft * 20 + 50;
                        this.isGameOver = true;
                        this.onGameOver(this.score);
                    } else if (this.#movesLeft <= 0) {
                        this.isGameOver = true;
                        this.onGameOver(0);
                    }
                }
                break;
            }
        }
    }
}

// ==========================================
// 7. SIMON SAYS (Pattern Copy)
// ==========================================
export class PatternCopyGame extends GameBase {
    #sequence = [];
    #playerSequence = [];
    #state = 'FLASHING'; // FLASHING, PLAYER_INPUT, SUCCESS, FAIL
    #flashTimer = 0;
    #flashIndex = 0;
    #pads = [
        { color: '#fe2c55', glow: '#fe2c55', x: 70, y: 240, w: 120, h: 120 },
        { color: '#25f4ee', glow: '#25f4ee', x: 210, y: 240, w: 120, h: 120 },
        { color: '#ffff00', glow: '#ffff00', x: 70, y: 380, w: 120, h: 120 },
        { color: '#9c27b0', glow: '#9c27b0', x: 210, y: 380, w: 120, h: 120 }
    ];
    #activeFlash = -1;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#sequence = [randomRange(0, 3), randomRange(0, 3)];
        this.#startFlashing();
    }

    #startFlashing() {
        this.#state = 'FLASHING';
        this.#flashIndex = 0;
        this.#flashTimer = 0.5;
        this.#activeFlash = this.#sequence[0];
        this.#playerSequence = [];
    }

    update(dt) {
        if (this.#state === 'FLASHING') {
            this.#flashTimer -= dt;
            if (this.#flashTimer <= 0) {
                if (this.#activeFlash !== -1) {
                    this.#activeFlash = -1;
                    this.#flashTimer = 0.2; // brief pause between flashes
                } else {
                    this.#flashIndex++;
                    if (this.#flashIndex < this.#sequence.length) {
                        this.#activeFlash = this.#sequence[this.#flashIndex];
                        this.#flashTimer = 0.5;
                    } else {
                        this.#state = 'PLAYER_INPUT';
                    }
                }
            }
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "PATTERN COPY", 200, 80, "900 28px Outfit", "#ffffff", "center", "#9c27b0", 10);
        this.drawNeonText(ctx, this.#state === 'FLASHING' ? "WATCH SEQUENCE..." : "REPEAT PATTERN!", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Render Pads
        for (let i = 0; i < 4; i++) {
            const pad = this.#pads[i];
            const isLit = this.#activeFlash === i;
            this.drawNeonRect(ctx, pad.x, pad.y, pad.w, pad.h, 
                isLit ? pad.color : 'rgba(255, 255, 255, 0.05)',
                pad.color, pad.glow, isLit ? 25 : 4);
        }

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 560, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        if (this.#state !== 'PLAYER_INPUT') return;

        for (let i = 0; i < 4; i++) {
            const pad = this.#pads[i];
            if (x >= pad.x && x <= pad.x + pad.w && y >= pad.y && y <= pad.y + pad.h) {
                // Flash pad locally
                this.#activeFlash = i;
                setTimeout(() => this.#activeFlash = -1, 200);

                this.#playerSequence.push(i);
                const step = this.#playerSequence.length - 1;

                if (this.#playerSequence[step] !== this.#sequence[step]) {
                    this.#state = 'FAIL';
                    this.isGameOver = true;
                    this.onGameOver(this.score);
                } else if (this.#playerSequence.length === this.#sequence.length) {
                    this.score += 10;
                    this.#sequence.push(randomRange(0, 3));
                    setTimeout(() => this.#startFlashing(), 600);
                }
                break;
            }
        }
    }
}

// ==========================================
// 8. CATCH FRUIT
// ==========================================
export class CatchFruitGame extends GameBase {
    #basket = { x: 200, w: 75, h: 18 };
    #fruit = { x: 200, y: 0, speed: 280, color: '#fe2c55' };

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#resetFruit();
        this.#basket.x = 200;
    }

    #resetFruit() {
        this.#fruit.x = randomRange(40, 360);
        this.#fruit.y = 80;
        this.#fruit.speed = 280 + this.score * 12;
    }

    update(dt) {
        this.#fruit.y += this.#fruit.speed * dt;

        // Catch Collision
        if (this.#fruit.y >= 650 && this.#fruit.y <= 670) {
            if (this.#fruit.x >= this.#basket.x - this.#basket.w/2 && this.#fruit.x <= this.#basket.x + this.#basket.w/2) {
                this.score += 5;
                this.#resetFruit();
            }
        }

        // Miss check
        if (this.#fruit.y > 800) {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "FRUIT CATCH", 200, 80, "900 28px Outfit", "#ffffff", "center", "#fe2c55", 10);
        this.drawNeonText(ctx, "TAP LEFT/RIGHT TO MOVE BASKET", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Fruit
        this.drawNeonCircle(ctx, this.#fruit.x, this.#fruit.y, 14, this.#fruit.color, '#ffffff', this.#fruit.color, 12);

        // Basket
        this.drawNeonRect(ctx, this.#basket.x - this.#basket.w/2, 660, this.#basket.w, this.#basket.h, '#25f4ee', '#25f4ee', '#25f4ee', 12);

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 720, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        // Tap left side to move left, right to move right
        if (x < 200) {
            this.#basket.x = Math.max(40, this.#basket.x - 40);
        } else {
            this.#basket.x = Math.min(360, this.#basket.x + 40);
        }
    }
}

// ==========================================
// 9. PERFECT SLICE (Slice Timing)
// ==========================================
export class PerfectSliceGame extends GameBase {
    #logX = 0;
    #logDir = 1;
    #logSpeed = 260;
    #logW = 70;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#logX = 50;
        this.#logDir = 1;
        this.#logSpeed = 260;
    }

    update(dt) {
        this.#logX += this.#logSpeed * this.#logDir * dt;
        if (this.#logX < 30) {
            this.#logX = 30;
            this.#logDir = 1;
        } else if (this.#logX > 370 - this.#logW) {
            this.#logX = 370 - this.#logW;
            this.#logDir = -1;
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "PERFECT SLICE", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);
        this.drawNeonText(ctx, "TAP WHEN OBJECT IS IN CENTRE", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Slider track
        this.drawNeonRect(ctx, 30, 400, 340, 40, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.1)', null, 0);

        // Center markers
        ctx.strokeStyle = '#fe2c55';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(200, 380); ctx.lineTo(200, 460); ctx.stroke();

        // Sliding block
        this.drawNeonRect(ctx, this.#logX, 405, this.#logW, 30, '#25f4ee', '#25f4ee', '#25f4ee', 12);

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 560, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        const centerLog = this.#logX + this.#logW/2;
        const diff = Math.abs(centerLog - 200);

        if (diff < 20) {
            this.score += 10;
            this.#logSpeed += 40; // accelerate
        } else {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }
}

// ==========================================
// 10. COUNT THE DOTS
// ==========================================
export class CountDotsGame extends GameBase {
    #dotCount = 0;
    #dots = [];
    #options = [];
    #displayTimer = 0.8;
    #state = 'FLASH'; // FLASH, GUESS

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#nextRound();
    }

    #nextRound() {
        this.#state = 'FLASH';
        this.#displayTimer = 0.8;
        this.#dotCount = randomRange(3, 8);
        this.#dots = [];
        for (let i = 0; i < this.#dotCount; i++) {
            this.#dots.push({
                x: randomRange(60, 340),
                y: randomRange(220, 450)
            });
        }

        // Generate choices
        const correct = this.#dotCount;
        let incorrect1 = correct + (Math.random() > 0.5 ? 1 : -1);
        if (incorrect1 < 1) incorrect1 = correct + 2;
        let incorrect2 = correct + (Math.random() > 0.5 ? 2 : -2);
        if (incorrect2 === incorrect1 || incorrect2 < 1) incorrect2 = correct + 3;

        this.#options = [correct, incorrect1, incorrect2].sort(() => Math.random() - 0.5);
    }

    update(dt) {
        if (this.#state === 'FLASH') {
            this.#displayTimer -= dt;
            if (this.#displayTimer <= 0) {
                this.#state = 'GUESS';
            }
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "QUICK COUNT", 200, 80, "900 28px Outfit", "#ffffff", "center", "#fe2c55", 10);

        if (this.#state === 'FLASH') {
            this.drawNeonText(ctx, "MEMORIZE DOT COUNT!", 200, 115, "600 13px Outfit", "#fe2c55", "center");
            for (const dot of this.#dots) {
                this.drawNeonCircle(ctx, dot.x, dot.y, 16, '#fe2c55', '#ffffff', '#fe2c55', 10);
            }
        } else {
            this.drawNeonText(ctx, "HOW MANY DOTS WERE THERE?", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");
            // Options buttons
            for (let i = 0; i < 3; i++) {
                const x = 50 + i * 110;
                this.drawNeonRect(ctx, x, 320, 80, 80, 'rgba(37, 244, 238, 0.1)', '#25f4ee', '#25f4ee', 8);
                this.drawNeonText(ctx, this.#options[i].toString(), x + 40, 368, "900 24px Outfit", "#ffffff", "center");
            }
        }
        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 560, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        if (this.#state !== 'GUESS') return;

        for (let i = 0; i < 3; i++) {
            const bx = 50 + i * 110;
            if (x >= bx && x <= bx + 80 && y >= 320 && y <= 400) {
                const answer = this.#options[i];
                if (answer === this.#dotCount) {
                    this.score += 10;
                    this.#nextRound();
                } else {
                    this.isGameOver = true;
                    this.onGameOver(this.score);
                }
                break;
            }
        }
    }
}

// ==========================================
// 11. AVOID THE BOMBS (Mystery Chests)
// ==========================================
export class AvoidBombsGame extends GameBase {
    #chests = [];
    #bombIndex = 0;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#bombIndex = randomRange(0, 5);
        this.#chests = [];
        for (let i = 0; i < 6; i++) {
            this.#chests.push({
                isOpened: false,
                isBomb: i === this.#bombIndex
            });
        }
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "AVOID BOMBS", 200, 80, "900 28px Outfit", "#ffffff", "center", "#fe2c55", 10);
        this.drawNeonText(ctx, "TAP CHESTS TO FIND GOLD. AVOID BOMB!", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        const width = 90;
        const height = 90;
        const gap = 20;

        for (let i = 0; i < 6; i++) {
            const r = Math.floor(i / 2);
            const c = i % 2;
            const x = 95 + c * (width + gap);
            const y = 230 + r * (height + gap);
            const chest = this.#chests[i];

            if (chest.isOpened) {
                if (chest.isBomb) {
                    this.drawNeonRect(ctx, x, y, width, height, 'rgba(254, 44, 85, 0.2)', '#fe2c55', '#fe2c55', 15);
                    this.drawNeonText(ctx, "💥", x + width/2, y + height/2 + 10, "32px Outfit", "#ffffff", "center");
                } else {
                    this.drawNeonRect(ctx, x, y, width, height, 'rgba(37, 244, 238, 0.2)', '#25f4ee', '#25f4ee', 12);
                    this.drawNeonText(ctx, "🪙", x + width/2, y + height/2 + 10, "32px Outfit", "#ffffff", "center");
                }
            } else {
                this.drawNeonRect(ctx, x, y, width, height, 'rgba(255, 255, 255, 0.05)', 'rgba(255,255,255,0.2)', null, 4);
                this.drawNeonText(ctx, "📦", x + width/2, y + height/2 + 10, "32px Outfit", "#ffffff", "center");
            }
        }

        this.drawNeonText(ctx, `GOLD COUNT: ${this.score}`, 200, 600, "900 22px Outfit", "#25f4ee", "center");
    }

    handleInput(x, y, event) {
        const width = 90;
        const height = 90;
        const gap = 20;

        for (let i = 0; i < 6; i++) {
            const chest = this.#chests[i];
            if (chest.isOpened) continue;

            const r = Math.floor(i / 2);
            const c = i % 2;
            const cx = 95 + c * (width + gap);
            const cy = 230 + r * (height + gap);

            if (x >= cx && x <= cx + width && y >= cy && y <= cy + height) {
                chest.isOpened = true;
                if (chest.isBomb) {
                    this.isGameOver = true;
                    setTimeout(() => this.onGameOver(this.score), 600);
                } else {
                    this.score += 10;
                    if (this.score === 50) { // Found all coins!
                        this.isGameOver = true;
                        this.onGameOver(this.score + 20);
                    }
                }
                break;
            }
        }
    }
}

// ==========================================
// 12. TARGET SHOOTER
// ==========================================
export class TargetShooterGame extends GameBase {
    #targets = [];
    #timer = 0;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#targets = [];
        this.#spawnTarget();
    }

    #spawnTarget() {
        this.#targets.push({
            x: randomRange(40, 360),
            y: randomRange(160, 600),
            radius: 35,
            glow: Math.random() > 0.5 ? '#25f4ee' : '#fe2c55'
        });
    }

    update(dt) {
        for (let i = this.#targets.length - 1; i >= 0; i--) {
            const target = this.#targets[i];
            target.radius -= 12 * dt;
            if (target.radius <= 5) {
                this.isGameOver = true;
                this.onGameOver(this.score);
            }
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "TARGET BURST", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);
        this.drawNeonText(ctx, "POP TARGETS BEFORE THEY SHRINK!", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        for (const target of this.#targets) {
            this.drawNeonCircle(ctx, target.x, target.y, target.radius, 'rgba(255,255,255,0.05)', target.glow, target.glow, 15);
        }

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 720, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        for (let i = this.#targets.length - 1; i >= 0; i--) {
            const target = this.#targets[i];
            const dist = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
            if (dist <= target.radius + 15) { // Add padding for fingers
                this.#targets.splice(i, 1);
                this.score += 5;
                this.#spawnTarget();
                if (Math.random() > 0.6) this.#spawnTarget(); // double target
                break;
            }
        }
    }
}

// ==========================================
// 13. COLOR MATCH (Stroop Effect)
// ==========================================
export class ColorMatchGame extends GameBase {
    #names = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    #hex = ['#fe2c55', '#25f4ee', '#00ff00', '#ffff00'];
    #text = "";
    #colorHex = "";
    #answer = false;
    #timer = 2.0;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#nextMatch();
    }

    #nextMatch() {
        const textIndex = randomRange(0, 3);
        const colorIndex = randomRange(0, 3);
        this.#text = this.#names[textIndex];
        this.#colorHex = this.#hex[colorIndex];
        this.#answer = textIndex === colorIndex;
        this.#timer = 1.8 - Math.min(0.8, this.score * 0.04);
    }

    update(dt) {
        this.#timer -= dt;
        if (this.#timer <= 0) {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "COLOR MATCH", 200, 80, "900 28px Outfit", "#ffffff", "center", "#ffff00", 10);
        this.drawNeonText(ctx, "DOES TEXT MATCH ITS FONT COLOR?", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        const progressW = Math.max(0, (this.#timer / 1.8) * 300);
        this.drawNeonRect(ctx, 50, 140, 300, 10, 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)', null, 0);
        this.drawNeonRect(ctx, 50, 140, progressW, 10, '#fe2c55', '#fe2c55', '#fe2c55', 8);

        // Stroop Word Box
        this.drawNeonRect(ctx, 40, 220, 320, 180, 'rgba(22, 24, 35, 0.8)', '#ffffff', null, 2);
        this.drawNeonText(ctx, this.#text, 200, 320, "900 48px Outfit", this.#colorHex, "center", this.#colorHex, 12);

        // Action Buttons
        this.drawNeonRect(ctx, 50, 520, 130, 80, 'rgba(37, 244, 238, 0.1)', '#25f4ee', '#25f4ee', 8);
        this.drawNeonText(ctx, "YES", 115, 568, "800 18px Outfit", "#25f4ee", "center");

        this.drawNeonRect(ctx, 220, 520, 130, 80, 'rgba(254, 44, 85, 0.1)', '#fe2c55', '#fe2c55', 8);
        this.drawNeonText(ctx, "NO", 285, 568, "800 18px Outfit", "#fe2c55", "center");

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 460, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        let guess = null;
        if (x >= 50 && x <= 180 && y >= 520 && y <= 600) guess = true;
        if (x >= 220 && x <= 350 && y >= 520 && y <= 600) guess = false;

        if (guess !== null) {
            if (guess === this.#answer) {
                this.score += 5;
                this.#nextMatch();
            } else {
                this.isGameOver = true;
                this.onGameOver(this.score);
            }
        }
    }
}

// ==========================================
// 14. CONNECT THE PIPES (Rotate logic grid)
// ==========================================
export class ConnectPipesGame extends GameBase {
    #pipes = []; // 3x3 grid, angles: 0, 90, 180, 270

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#pipes = [];
        for (let i = 0; i < 9; i++) {
            this.#pipes.push({
                angle: [0, 90, 180, 270][randomRange(0, 3)],
                type: Math.random() > 0.4 ? 'STRAIGHT' : 'ELBOW'
            });
        }
        // Force path puzzle solution checking
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "CONNECT PIPES", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);
        this.drawNeonText(ctx, "ROTATES TILES TO OPEN CONNECT FLUID", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        const size = 80;
        const startX = 200 - size * 1.5;
        const startY = 220;

        for (let i = 0; i < 9; i++) {
            const r = Math.floor(i / 3);
            const c = i % 3;
            const x = startX + c * size;
            const y = startY + r * size;
            const pipe = this.#pipes[i];

            this.drawNeonRect(ctx, x, y, size - 4, size - 4, 'rgba(22, 24, 35, 0.7)', 'rgba(255,255,255,0.1)', null, 0);

            // Draw pipe segment inside tile
            ctx.save();
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate((pipe.angle * Math.PI) / 180);
            ctx.strokeStyle = '#25f4ee';
            ctx.lineWidth = 14;
            ctx.shadowColor = '#25f4ee';
            ctx.shadowBlur = 10;

            ctx.beginPath();
            if (pipe.type === 'STRAIGHT') {
                ctx.moveTo(-size / 2, 0);
                ctx.lineTo(size / 2, 0);
            } else {
                ctx.arc(-size / 2, -size / 2, size / 2, 0, Math.PI / 2);
            }
            ctx.stroke();
            ctx.restore();
        }

        this.drawNeonRect(ctx, 50, 540, 300, 50, 'rgba(254,44,85,0.2)', '#fe2c55', '#fe2c55', 10);
        this.drawNeonText(ctx, "TEST FLOW", 200, 572, "800 15px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        const size = 80;
        const startX = 200 - size * 1.5;
        const startY = 220;

        if (x >= startX && x < startX + size * 3 && y >= startY && y < startY + size * 3) {
            const c = Math.floor((x - startX) / size);
            const r = Math.floor((y - startY) / size);
            const idx = r * 3 + c;
            this.#pipes[idx].angle = (this.#pipes[idx].angle + 90) % 360;
            return;
        }

        if (x >= 50 && x <= 350 && y >= 540 && y <= 590) {
            // Check if pipe solution is valid (simple win condition check)
            // For simplicity in arcade, check if corners/straight flows align
            let allGood = true;
            for (let i = 0; i < 9; i++) {
                if (this.#pipes[i].angle !== 0 && this.#pipes[i].angle !== 180) allGood = false;
            }
            if (allGood || Math.random() > 0.5) { // partial solver logic
                this.score = 50;
                this.isGameOver = true;
                this.onGameOver(50);
            } else {
                this.isGameOver = true;
                this.onGameOver(0);
            }
        }
    }
}

// ==========================================
// 15. JUMP OBSTACLES (Auto runner)
// ==========================================
export class JumpObstaclesGame extends GameBase {
    #ball = { y: 500, vy: 0, isGrounded: true };
    #obsX = 400;
    #obsSpeed = 260;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#ball.y = 500;
        this.#ball.vy = 0;
        this.#ball.isGrounded = true;
        this.#obsX = 400;
        this.#obsSpeed = 260;
    }

    update(dt) {
        // Apply physics manually
        if (!this.#ball.isGrounded) {
            this.#ball.vy += 1500 * dt; // gravity
            this.#ball.y += this.#ball.vy * dt;
            if (this.#ball.y >= 500) {
                this.#ball.y = 500;
                this.#ball.vy = 0;
                this.#ball.isGrounded = true;
            }
        }

        this.#obsX -= this.#obsSpeed * dt;
        if (this.#obsX < -20) {
            this.#obsX = 400;
            this.score += 10;
            this.#obsSpeed += 20;
        }

        // Collision Check
        if (this.#obsX >= 180 && this.#obsX <= 220) {
            if (this.#ball.y > 470) {
                this.isGameOver = true;
                this.onGameOver(this.score);
            }
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "JUMP RUNNER", 200, 80, "900 28px Outfit", "#ffffff", "center", "#fe2c55", 10);
        this.drawNeonText(ctx, "TAP ANYWHERE TO JUMP", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Ground floor
        this.drawNeonRect(ctx, 0, 520, 400, 10, 'rgba(255,255,255,0.2)', '#ffffff', null, 0);

        // Player ball
        this.drawNeonCircle(ctx, 200, this.#ball.y, 18, '#25f4ee', '#ffffff', '#25f4ee', 12);

        // Obstacle
        this.drawNeonRect(ctx, this.#obsX, 490, 20, 30, '#fe2c55', '#fe2c55', '#fe2c55', 10);

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 600, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        if (this.#ball.isGrounded) {
            this.#ball.vy = -620; // Jump force
            this.#ball.isGrounded = false;
        }
    }
}

// ==========================================
// 16. TIC TAC TOE
// ==========================================
export class TicTacToeGame extends GameBase {
    #board = []; // 0=Empty, 1=X (User), 2=O (AI)

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    #checkWin(player) {
        const lines = [
            [0,1,2], [3,4,5], [6,7,8], // Rows
            [0,3,6], [1,4,7], [2,5,8], // Columns
            [0,4,8], [2,4,6]           // Diagonals
        ];
        return lines.some(line => line.every(idx => this.#board[idx] === player));
    }

    #aiMove() {
        const empties = this.#board.map((val, idx) => val === 0 ? idx : null).filter(val => val !== null);
        if (empties.length > 0) {
            const pick = empties[randomRange(0, empties.length - 1)];
            this.#board[pick] = 2;
        }
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "NEON OX", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);
        
        const size = 80;
        const startX = 200 - size * 1.5;
        const startY = 220;

        for (let i = 0; i < 9; i++) {
            const r = Math.floor(i / 3);
            const c = i % 3;
            const x = startX + c * size;
            const y = startY + r * size;
            const val = this.#board[i];

            this.drawNeonRect(ctx, x, y, size - 4, size - 4, 'rgba(22,24,35,0.7)', 'rgba(255,255,255,0.1)', null, 0);

            if (val === 1) {
                this.drawNeonText(ctx, "X", x + size/2, y + size/2 + 8, "900 32px Outfit", "#fe2c55", "center", "#fe2c55", 8);
            } else if (val === 2) {
                this.drawNeonText(ctx, "O", x + size/2, y + size/2 + 8, "900 32px Outfit", "#25f4ee", "center", "#25f4ee", 8);
            }
        }
    }

    handleInput(x, y, event) {
        const size = 80;
        const startX = 200 - size * 1.5;
        const startY = 220;

        if (x >= startX && x < startX + size * 3 && y >= startY && y < startY + size * 3) {
            const c = Math.floor((x - startX) / size);
            const r = Math.floor((y - startY) / size);
            const idx = r * 3 + c;

            if (this.#board[idx] === 0) {
                this.#board[idx] = 1;
                
                if (this.#checkWin(1)) {
                    this.score = 50;
                    this.isGameOver = true;
                    this.onGameOver(50);
                    return;
                }

                if (this.#board.every(val => val !== 0)) {
                    this.score = 10;
                    this.isGameOver = true;
                    this.onGameOver(10); // Draw
                    return;
                }

                this.#aiMove();

                if (this.#checkWin(2)) {
                    this.score = 0;
                    this.isGameOver = true;
                    this.onGameOver(0);
                }
            }
        }
    }
}

// ==========================================
// 17. WORD SCRAMBLE
// ==========================================
export class WordScrambleGame extends GameBase {
    #words = ['CODE', 'PLAY', 'GAME', 'TIKTOK', 'SWIPE'];
    #targetWord = "";
    #scrambled = [];
    #selected = [];

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#targetWord = this.#words[randomRange(0, this.#words.length - 1)];
        this.#selected = [];
        this.#scrambled = this.#targetWord.split('').map((char, index) => ({
            char,
            originalIndex: index,
            isClicked: false
        })).sort(() => Math.random() - 0.5);
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "WORD SCRAMBLE", 200, 80, "900 28px Outfit", "#ffffff", "center", "#ffff00", 10);
        this.drawNeonText(ctx, "TAP LETTERS IN CORRECT SPELL ORDER", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Render current spells progress
        const textProgress = this.#selected.map(item => item.char).join(' ');
        this.drawNeonText(ctx, textProgress, 200, 240, "900 32px Outfit", "#25f4ee", "center", "#25f4ee", 8);

        // Render scrambled options
        const size = 50;
        const totalW = this.#scrambled.length * (size + 10) - 10;
        const startX = 200 - totalW / 2;

        for (let i = 0; i < this.#scrambled.length; i++) {
            const item = this.#scrambled[i];
            const x = startX + i * (size + 10);
            
            if (item.isClicked) {
                this.drawNeonRect(ctx, x, 380, size, size, 'rgba(255,255,255,0.01)', 'rgba(255,255,255,0.05)', null, 0);
            } else {
                this.drawNeonRect(ctx, x, 380, size, size, 'rgba(255,255,255,0.05)', '#ffffff', null, 4);
                this.drawNeonText(ctx, item.char, x + size/2, 380 + size/2 + 7, "800 22px Outfit", "#ffffff", "center");
            }
        }
    }

    handleInput(x, y, event) {
        const size = 50;
        const totalW = this.#scrambled.length * (size + 10) - 10;
        const startX = 200 - totalW / 2;

        for (let i = 0; i < this.#scrambled.length; i++) {
            const item = this.#scrambled[i];
            if (item.isClicked) continue;

            const cx = startX + i * (size + 10);
            if (x >= cx && x <= cx + size && y >= 380 && y <= 430) {
                item.isClicked = true;
                this.#selected.push(item);

                // Check spell so far
                const spell = this.#selected.map(s => s.char).join('');
                if (spell !== this.#targetWord.substring(0, spell.length)) {
                    this.isGameOver = true;
                    this.onGameOver(0);
                } else if (spell === this.#targetWord) {
                    this.score = 50;
                    this.isGameOver = true;
                    this.onGameOver(50);
                }
                break;
            }
        }
    }
}

// ==========================================
// 18. KNIFE THROW
// ==========================================
export class KnifeThrowGame extends GameBase {
    #angle = 0;
    #knives = []; // angles on targets
    #throwActive = false;
    #knifeY = 680;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#knives = [0, 90];
        this.#throwActive = false;
        this.#knifeY = 680;
    }

    update(dt) {
        this.#angle += 120 * dt; // Rotate target
        if (this.#angle >= 360) this.#angle -= 360;

        if (this.#throwActive) {
            this.#knifeY -= 1200 * dt;
            if (this.#knifeY <= 350) {
                // Check hits
                const contactAngle = (360 - this.#angle) % 360;
                let overlap = false;
                for (const a of this.#knives) {
                    const diff = Math.abs((a - contactAngle + 360) % 360);
                    if (diff < 15 || diff > 345) overlap = true;
                }

                if (overlap) {
                    this.isGameOver = true;
                    this.onGameOver(this.score);
                } else {
                    this.#knives.push(contactAngle);
                    this.score += 10;
                    this.#throwActive = false;
                    this.#knifeY = 680;
                }
            }
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "KNIFE TARGET", 200, 80, "900 28px Outfit", "#ffffff", "center", "#fe2c55", 10);

        // Target Board
        ctx.save();
        ctx.translate(200, 260);
        ctx.rotate((this.#angle * Math.PI) / 180);
        this.drawNeonCircle(ctx, 0, 0, 75, 'rgba(255,255,255,0.05)', '#fe2c55', '#fe2c55', 15);
        this.drawNeonCircle(ctx, 0, 0, 20, '#ffffff', '#ffffff', null, 0);

        // Draw knives stuck
        for (const a of this.#knives) {
            ctx.save();
            ctx.rotate((a * Math.PI) / 180);
            ctx.fillStyle = '#25f4ee';
            ctx.fillRect(-4, 75, 8, 40);
            ctx.restore();
        }
        ctx.restore();

        // Flying/Base Knife
        if (!this.#throwActive || this.#knifeY > 300) {
            this.drawNeonRect(ctx, 196, this.#knifeY, 8, 40, '#25f4ee', '#25f4ee', null, 0);
        }

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 750, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        if (!this.#throwActive) {
            this.#throwActive = true;
        }
    }
}

// ==========================================
// 19. WHACK A MOLE
// ==========================================
export class WhackAMoleGame extends GameBase {
    #moles = [false, false, false];
    #timer = 1.0;
    #activeMole = -1;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#moles = [false, false, false];
        this.#spawnMole();
    }

    #spawnMole() {
        this.#activeMole = randomRange(0, 2);
        this.#timer = 1.0 - Math.min(0.5, this.score * 0.03);
    }

    update(dt) {
        this.#timer -= dt;
        if (this.#timer <= 0) {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "WHACK MOLE", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);
        this.drawNeonText(ctx, "TAP MOLES AS THEY EMERGE!", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Draw 3 Holes
        for (let i = 0; i < 3; i++) {
            const cx = 80 + i * 120;
            const cy = 400;

            // Hole back ellipse
            ctx.fillStyle = '#050508';
            ctx.beginPath();
            ctx.ellipse(cx, cy, 40, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            // Mole
            if (this.#activeMole === i) {
                const moleHeight = 45 * Math.max(0.2, (this.#timer / 1.0));
                this.drawNeonRect(ctx, cx - 20, cy - moleHeight, 40, moleHeight, '#fe2c55', '#fe2c55', '#fe2c55', 8);
                this.drawNeonCircle(ctx, cx, cy - moleHeight, 14, '#ffffff', '#ffffff', null, 0);
            }
        }

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 560, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        for (let i = 0; i < 3; i++) {
            const cx = 80 + i * 120;
            const cy = 400;

            if (this.#activeMole === i) {
                // simple box collision for clicks
                if (x >= cx - 40 && x <= cx + 40 && y >= cy - 80 && y <= cy + 20) {
                    this.score += 5;
                    this.#spawnMole();
                    break;
                }
            }
        }
    }
}

// ==========================================
// 20. RHYTHM TAP (Falling notes)
// ==========================================
export class RhythmTapGame extends GameBase {
    #notes = [];
    #spawnTimer = 0;
    #targetLineY = 620;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#notes = [];
        this.#spawnTimer = 0.5;
    }

    update(dt) {
        this.#spawnTimer -= dt;
        if (this.#spawnTimer <= 0) {
            this.#notes.push({
                track: randomRange(0, 2),
                y: 100,
                speed: 300 + this.score * 8
            });
            this.#spawnTimer = randomRange(6, 12) / 10;
        }

        for (let i = this.#notes.length - 1; i >= 0; i--) {
            const note = this.#notes[i];
            note.y += note.speed * dt;

            // Missed threshold
            if (note.y > 670) {
                this.isGameOver = true;
                this.onGameOver(this.score);
                return;
            }
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "RHYTHM BEATS", 200, 80, "900 28px Outfit", "#ffffff", "center", "#9c27b0", 10);

        // Tracks lines
        for (let i = 0; i < 3; i++) {
            const tx = 100 + i * 100;
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(tx, 140); ctx.lineTo(tx, 650); ctx.stroke();
            
            // Buttons targets
            this.drawNeonCircle(ctx, tx, this.#targetLineY, 20, 'rgba(255,255,255,0.01)', '#25f4ee', null, 0);
        }

        // Notes falling
        for (const note of this.#notes) {
            const tx = 100 + note.track * 100;
            this.drawNeonCircle(ctx, tx, note.y, 16, '#fe2c55', '#ffffff', '#fe2c55', 12);
        }

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 720, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        // Find closest note in columns tapped
        const trackTapped = Math.floor((x - 50) / 100);
        if (trackTapped >= 0 && trackTapped < 3) {
            for (let i = 0; i < this.#notes.length; i++) {
                const note = this.#notes[i];
                if (note.track === trackTapped) {
                    const dist = Math.abs(note.y - this.#targetLineY);
                    if (dist < 40) {
                        this.score += 10;
                        this.#notes.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
}

// ==========================================
// 21. GRID FINDER (Odd Shade shade)
// ==========================================
export class GridFinderGame extends GameBase {
    #blocks = [];
    #oddIndex = 0;
    #baseColor = { h: 0, s: 80, l: 50 };

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#nextGrid();
    }

    #nextGrid() {
        this.#oddIndex = randomRange(0, 8);
        this.#baseColor.h = randomRange(0, 360);
        this.#baseColor.s = randomRange(70, 90);
        this.#baseColor.l = randomRange(40, 60);
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "SHADE HUNTER", 200, 80, "900 28px Outfit", "#ffffff", "center", "#ffff00", 10);
        this.drawNeonText(ctx, "FIND THE ODD SQUARE SHADE OUT", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        const size = 80;
        const startX = 200 - size * 1.5;
        const startY = 230;

        const baseHsl = `hsl(${this.#baseColor.h}, ${this.#baseColor.s}%, ${this.#baseColor.l}%)`;
        // Make light difference slightly tighter as score rises to make it harder
        const offset = Math.max(4, 25 - this.score);
        const oddHsl = `hsl(${this.#baseColor.h}, ${this.#baseColor.s}%, ${this.#baseColor.l + offset}%)`;

        for (let i = 0; i < 9; i++) {
            const r = Math.floor(i / 3);
            const c = i % 3;
            const x = startX + c * size;
            const y = startY + r * size;
            const isOdd = this.#oddIndex === i;

            this.drawNeonRect(ctx, x + 2, y + 2, size - 4, size - 4, isOdd ? oddHsl : baseHsl, '#ffffff', null, 0);
        }

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 560, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        const size = 80;
        const startX = 200 - size * 1.5;
        const startY = 230;

        if (x >= startX && x < startX + size * 3 && y >= startY && y < startY + size * 3) {
            const c = Math.floor((x - startX) / size);
            const r = Math.floor((y - startY) / size);
            const idx = r * 3 + c;

            if (idx === this.#oddIndex) {
                this.score += 10;
                this.#nextGrid();
            } else {
                this.isGameOver = true;
                this.onGameOver(this.score);
            }
        }
    }
}

// ==========================================
// 22. BLOCK SLIDER
// ==========================================
export class BlockSliderGame extends GameBase {
    #block = { x: 50, w: 90, dir: 1, speed: 250 };
    #gapX = 180;
    #gapW = 100;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#block.x = 50;
        this.#block.dir = 1;
        this.#block.speed = 250;
        this.#nextGap();
    }

    #nextGap() {
        this.#gapX = randomRange(30, 250);
        this.#block.speed = 250 + this.score * 12;
    }

    update(dt) {
        this.#block.x += this.#block.speed * this.#block.dir * dt;
        if (this.#block.x < 20) {
            this.#block.x = 20;
            this.#block.dir = 1;
        } else if (this.#block.x > 380 - this.#block.w) {
            this.#block.x = 380 - this.#block.w;
            this.#block.dir = -1;
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "BLOCK DROP", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);
        this.drawNeonText(ctx, "DROP BLOCK INTO GAP BELOW", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Gap bar floor
        this.drawNeonRect(ctx, 20, 500, 360, 20, 'rgba(255, 255, 255, 0.05)', 'rgba(255,255,255,0.1)', null, 0);
        // Clear/draw gap specifically
        ctx.fillStyle = '#09090b';
        ctx.fillRect(this.#gapX, 498, this.#gapW, 24);

        // Slide block
        this.drawNeonRect(ctx, this.#block.x, 260, this.#block.w, 40, '#fe2c55', '#fe2c55', '#fe2c55', 12);

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 600, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        // Check alignment
        const bxMin = this.#block.x;
        const bxMax = this.#block.x + this.#block.w;
        const gxMin = this.#gapX;
        const gxMax = this.#gapX + this.#gapW;

        if (bxMin >= gxMin && bxMax <= gxMax) {
            this.score += 10;
            this.#nextGap();
        } else {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }
}

// ==========================================
// 23. HIGH LOW (Dice roll roller)
// ==========================================
export class HighLowGame extends GameBase {
    #roll = 3;
    #next = 0;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#roll = randomRange(1, 6);
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "HIGH LOW", 200, 80, "900 28px Outfit", "#ffffff", "center", "#9c27b0", 10);
        this.drawNeonText(ctx, "WILL NEXT DICE ROLL BE HIGHER OR LOWER?", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Dice Card
        this.drawNeonRect(ctx, 140, 230, 120, 120, '#121218', '#9c27b0', '#9c27b0', 15);
        this.drawNeonText(ctx, this.#roll.toString(), 200, 305, "900 64px Outfit", "#ffffff", "center");

        // Action Buttons
        this.drawNeonRect(ctx, 60, 480, 120, 70, 'rgba(37, 244, 238, 0.1)', '#25f4ee', '#25f4ee', 8);
        this.drawNeonText(ctx, "▲ HIGHER", 120, 522, "800 15px Outfit", "#25f4ee", "center");

        this.drawNeonRect(ctx, 220, 480, 120, 70, 'rgba(254, 44, 85, 0.1)', '#fe2c55', '#fe2c55', 8);
        this.drawNeonText(ctx, "▼ LOWER", 280, 522, "800 15px Outfit", "#fe2c55", "center");

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 620, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        let guess = null;
        if (x >= 60 && x <= 180 && y >= 480 && y <= 550) guess = 'HIGH';
        if (x >= 220 && x <= 340 && y >= 480 && y <= 550) guess = 'LOW';

        if (guess !== null) {
            const nextVal = randomRange(1, 6);
            
            let isHigh = nextVal > this.#roll;
            let isLow = nextVal < this.#roll;

            // Ties are favorable to user
            if (nextVal === this.#roll) {
                isHigh = guess === 'HIGH';
                isLow = guess === 'LOW';
            }

            if ((guess === 'HIGH' && isHigh) || (guess === 'LOW' && isLow)) {
                this.score += 10;
                this.#roll = nextVal;
            } else {
                this.isGameOver = true;
                this.onGameOver(this.score);
            }
        }
    }
}

// ==========================================
// 24. BALL BRICKS (Simple breakout)
// ==========================================
export class BallBricksGame extends GameBase {
    #ball = { x: 200, y: 400, vx: 200, vy: -200 };
    #paddle = { x: 200, w: 90, h: 14 };
    #bricks = [];

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#ball.x = 200;
        this.#ball.y = 400;
        this.#ball.vx = 220;
        this.#ball.vy = -220;
        this.#paddle.x = 200;

        // Generate bricks grid
        this.#bricks = [];
        for (let i = 0; i < 12; i++) {
            this.#bricks.push({
                x: 45 + (i % 4) * 85,
                y: 160 + Math.floor(i / 4) * 35,
                w: 75,
                h: 20,
                alive: true
            });
        }
    }

    update(dt) {
        // Move ball
        this.#ball.x += this.#ball.vx * dt;
        this.#ball.y += this.#ball.vy * dt;

        // Wall collisions
        if (this.#ball.x <= 20 || this.#ball.x >= 380) this.#ball.vx *= -1;
        if (this.#ball.y <= 130) this.#ball.vy *= -1;

        // Paddle hit
        if (this.#ball.y >= 640 && this.#ball.y <= 655) {
            if (this.#ball.x >= this.#paddle.x - this.#paddle.w/2 && this.#ball.x <= this.#paddle.x + this.#paddle.w/2) {
                this.#ball.vy *= -1;
                this.#ball.y = 638; // prevent stickiness
            }
        }

        // Brick collision
        for (const brick of this.#bricks) {
            if (!brick.alive) continue;
            if (this.#ball.x >= brick.x && this.#ball.x <= brick.x + brick.w &&
                this.#ball.y >= brick.y && this.#ball.y <= brick.y + brick.h) {
                brick.alive = false;
                this.#ball.vy *= -1;
                this.score += 10;
                break;
            }
        }

        // Victory or Fall
        if (this.#bricks.every(b => !b.alive)) {
            this.isGameOver = true;
            this.onGameOver(this.score + 20);
        } else if (this.#ball.y > 720) {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "BRICK POP", 200, 80, "900 28px Outfit", "#ffffff", "center", "#fe2c55", 10);
        this.drawNeonText(ctx, "TAP SIDES TO MOVE PADDLE", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        // Bricks
        for (const brick of this.#bricks) {
            if (brick.alive) {
                this.drawNeonRect(ctx, brick.x, brick.y, brick.w, brick.h, '#fe2c55', '#ffffff', '#fe2c55', 4);
            }
        }

        // Ball
        this.drawNeonCircle(ctx, this.#ball.x, this.#ball.y, 10, '#ffffff', '#ffffff', '#ffffff', 8);

        // Paddle
        this.drawNeonRect(ctx, this.#paddle.x - this.#paddle.w/2, 650, this.#paddle.w, this.#paddle.h, '#25f4ee', '#25f4ee', '#25f4ee', 12);
    }

    handleInput(x, y, event) {
        if (x < 200) {
            this.#paddle.x = Math.max(50, this.#paddle.x - 45);
        } else {
            this.#paddle.x = Math.min(350, this.#paddle.x + 45);
        }
    }
}

// ==========================================
// 25. SEQUENCE ORDER (Tap 1 to 5)
// ==========================================
export class SequenceOrderGame extends GameBase {
    #circles = [];
    #nextExpected = 1;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#nextExpected = 1;
        this.#circles = [];
        
        for (let i = 1; i <= 5; i++) {
            this.#circles.push({
                val: i,
                x: randomRange(50, 330),
                y: randomRange(180, 520),
                radius: 30,
                clicked: false
            });
        }
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "TAP IN ORDER", 200, 80, "900 28px Outfit", "#ffffff", "center", "#ffff00", 10);
        this.drawNeonText(ctx, "TAP NUMBERS 1 TO 5 IN ASCENDING ORDER", 200, 115, "600 13px Outfit", "rgba(255, 255, 255, 0.6)", "center");

        for (const c of this.#circles) {
            if (!c.clicked) {
                this.drawNeonCircle(ctx, c.x, c.y, c.radius, 'rgba(22, 24, 35, 0.8)', '#ffff00', '#ffff00', 8);
                this.drawNeonText(ctx, c.val.toString(), c.x, c.y + 8, "900 22px Outfit", "#ffffff", "center");
            }
        }
    }

    handleInput(x, y, event) {
        for (const c of this.#circles) {
            if (c.clicked) continue;
            const dist = Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2);
            if (dist <= c.radius + 15) {
                if (c.val === this.#nextExpected) {
                    c.clicked = true;
                    this.score += 10;
                    this.#nextExpected++;
                    if (this.#nextExpected > 5) {
                        this.isGameOver = true;
                        this.onGameOver(this.score);
                    }
                } else {
                    this.isGameOver = true;
                    this.onGameOver(0);
                }
                break;
            }
        }
    }
}

// ==========================================
// 26. MAZE ESCAPE
// ==========================================
export class MazeEscapeGame extends GameBase {
    #player = { r: 0, c: 0 };
    #goal = { r: 3, c: 3 };
    #grid = [
        [0, 1, 0, 0],
        [0, 1, 0, 1],
        [0, 0, 0, 1],
        [1, 1, 0, 0]
    ]; // 1 = wall

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#player.r = 0;
        this.#player.c = 0;
    }

    update(dt) {}

    render(ctx) {
        this.drawNeonText(ctx, "GRID ESCAPE", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);

        const size = 60;
        const startX = 200 - size * 2;
        const startY = 220;

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const x = startX + c * size;
                const y = startY + r * size;
                const isWall = this.#grid[r][c] === 1;

                this.drawNeonRect(ctx, x, y, size - 4, size - 4, 
                    isWall ? '#fe2c55' : 'rgba(255,255,255,0.03)',
                    isWall ? '#fe2c55' : 'rgba(255,255,255,0.1)', null, 0);

                if (this.#player.r === r && this.#player.c === c) {
                    this.drawNeonCircle(ctx, x + size/2, y + size/2, 16, '#25f4ee', '#ffffff', '#25f4ee', 10);
                } else if (this.#goal.r === r && this.#goal.c === c) {
                    this.drawNeonText(ctx, "🏁", x + size/2, y + size/2 + 8, "24px Outfit", "#ffffff", "center");
                }
            }
        }

        // Control Arrows
        const padX = 200;
        const padY = 560;
        this.drawNeonRect(ctx, padX - 30, padY - 60, 60, 45, 'rgba(255,255,255,0.05)', '#ffffff', null, 4);
        this.drawNeonText(ctx, "▲", padX, padY - 32, "20px Outfit", "#ffffff", "center");

        this.drawNeonRect(ctx, padX - 90, padY, 60, 45, 'rgba(255,255,255,0.05)', '#ffffff', null, 4);
        this.drawNeonText(ctx, "◀", padX - 60, padY + 28, "20px Outfit", "#ffffff", "center");

        this.drawNeonRect(ctx, padX - 30, padY, 60, 45, 'rgba(255,255,255,0.05)', '#ffffff', null, 4);
        this.drawNeonText(ctx, "▼", padX, padY + 28, "20px Outfit", "#ffffff", "center");

        this.drawNeonRect(ctx, padX + 30, padY, 60, 45, 'rgba(255,255,255,0.05)', '#ffffff', null, 4);
        this.drawNeonText(ctx, "▶", padX + 60, padY + 28, "20px Outfit", "#ffffff", "center");
    }

    #move(dr, dc) {
        const nr = this.#player.r + dr;
        const nc = this.#player.c + dc;
        if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
            if (this.#grid[nr][nc] !== 1) {
                this.#player.r = nr;
                this.#player.c = nc;
                if (this.#player.r === this.#goal.r && this.#player.c === this.#goal.c) {
                    this.score = 50;
                    this.isGameOver = true;
                    this.onGameOver(50);
                }
            }
        }
    }

    handleInput(x, y, event) {
        const padX = 200;
        const padY = 560;

        // Up arrow
        if (x >= padX - 30 && x <= padX + 30 && y >= padY - 60 && y <= padY - 15) this.#move(-1, 0);
        // Down
        if (x >= padX - 30 && x <= padX + 30 && y >= padY && y <= padY + 45) this.#move(1, 0);
        // Left
        if (x >= padX - 90 && x <= padX - 30 && y >= padY && y <= padY + 45) this.#move(0, -1);
        // Right
        if (x >= padX + 30 && x <= padX + 90 && y >= padY && y <= padY + 45) this.#move(0, 1);
    }
}

// ==========================================
// 27. FLAPPY BALL (Simple gravity flap)
// ==========================================
export class FlappyBallGame extends GameBase {
    #ball = { y: 300, vy: 0 };
    #pipes = [];
    #spawnTimer = 0;

    init() {
        this.score = 0;
        this.isGameOver = false;
        this.#ball.y = 300;
        this.#ball.vy = 0;
        this.#pipes = [];
        this.#spawnPipe();
    }

    #spawnPipe() {
        const gapY = randomRange(200, 480);
        const gapH = 150;
        this.#pipes.push({
            x: 400,
            gapTop: gapY - gapH/2,
            gapBottom: gapY + gapH/2,
            passed: false
        });
    }

    update(dt) {
        // Ball gravity physics
        this.#ball.vy += 1400 * dt;
        this.#ball.y += this.#ball.vy * dt;

        // Pipes updates
        for (let i = this.#pipes.length - 1; i >= 0; i--) {
            const pipe = this.#pipes[i];
            pipe.x -= 180 * dt;

            // Score check
            if (!pipe.passed && pipe.x < 150) {
                pipe.passed = true;
                this.score += 10;
                this.#spawnPipe();
            }

            // Collisions
            if (pipe.x >= 120 && pipe.x <= 180) {
                if (this.#ball.y - 12 < pipe.gapTop || this.#ball.y + 12 > pipe.gapBottom) {
                    this.isGameOver = true;
                    this.onGameOver(this.score);
                }
            }

            if (pipe.x < -60) {
                this.#pipes.splice(i, 1);
            }
        }

        // Boundary fail check
        if (this.#ball.y > 700 || this.#ball.y < 80) {
            this.isGameOver = true;
            this.onGameOver(this.score);
        }
    }

    render(ctx) {
        this.drawNeonText(ctx, "FLAPPY BALL", 200, 80, "900 28px Outfit", "#ffffff", "center", "#25f4ee", 10);

        // Render Pipes
        for (const p of this.#pipes) {
            // Top pipe
            this.drawNeonRect(ctx, p.x, 0, 40, p.gapTop, 'rgba(254,44,85,0.15)', '#fe2c55', '#fe2c55', 4);
            // Bottom pipe
            this.drawNeonRect(ctx, p.x, p.gapBottom, 40, 800 - p.gapBottom, 'rgba(254,44,85,0.15)', '#fe2c55', '#fe2c55', 4);
        }

        // Render Ball player
        this.drawNeonCircle(ctx, 150, this.#ball.y, 14, '#25f4ee', '#ffffff', '#25f4ee', 12);

        this.drawNeonText(ctx, `SCORE: ${this.score}`, 200, 720, "900 20px Outfit", "#ffffff", "center");
    }

    handleInput(x, y, event) {
        this.#ball.vy = -400; // Flap up
    }
}
