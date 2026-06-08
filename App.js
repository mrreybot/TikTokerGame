/**
 * App.js
 * 
 * Demonstrates:
 * - PL Concept 1: Functions/Procedures (Orchestration callback loops, DOM updates).
 * - PL Concept 2: Scope and Closures (Event listener callbacks binding this/lexical environment).
 * - PL Concept 3: Dynamic Memory / Heap Allocation (Dynamic instantiations of game types and score nodes).
 * - PL Concept 4: User-defined Types (Orchestrator Class).
 * - PL Concept 5: Abstraction and Encapsulation (Hiding active engine states and routing details).
 * - PL Concept 7: Type Usage & Input Domain Validation.
 * - PL Elective Concept 1: Event-driven design (Orchestrating DOM view toggles).
 */

import { GameEngine } from './Engine.js';
import { LinkedList, CircularDoublyLinkedList } from './DataStructures.js';
import { BalanceGame } from './games/BalanceGame.js';
import { FallGame } from './games/FallGame.js';
import { SortGame } from './games/SortGame.js';
import {
    SudokuGame, MemoryGame, ReactionGame, MathSpeedGame, TapSpeedGame,
    ColorFloodGame, PatternCopyGame, CatchFruitGame, PerfectSliceGame, CountDotsGame,
    AvoidBombsGame, TargetShooterGame, ColorMatchGame, ConnectPipesGame, JumpObstaclesGame,
    TicTacToeGame, WordScrambleGame, KnifeThrowGame, WhackAMoleGame, RhythmTapGame,
    GridFinderGame, BlockSliderGame, OperatorFinderGame, BallBricksGame, SequenceOrderGame,
    MazeEscapeGame, FlappyBallGame
} from './games/NewMiniGames.js';
import { firebaseConfig, isFirebaseConfigured } from './FirebaseConfig.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

class App {
    // Encapsulated states (PL Concept 5)
    #engine = null;
    #leaderboard = null;
    #gameList = null;
    #currentUsername = "TikToker";
    #activeGameName = "";
    #storageKey = "tiktok_arcade_leaderboard_v1";
    #db = null;
    #isDbOnline = false;
    #arcadeTotalScore = 0;
    #gamesPlayedCount = 0;

    constructor() {
        // Initialize dynamic sorted LinkedList for leaderboard
        this.#leaderboard = new LinkedList(10);
        
        // Initialize Firebase database connection (PL Concept 10: Exception Handling)
        if (isFirebaseConfigured()) {
            try {
                const app = initializeApp(firebaseConfig);
                this.#db = getFirestore(app);
                this.#isDbOnline = true;
                console.log("Firebase Database Connection Successful!");
            } catch (e) {
                console.warn("Firebase configuration error. Falling back to local offline mode.", e);
                this.#isDbOnline = false;
            }
        } else {
            console.log("Firebase not configured. Running in Local Offline Mode.");
            this.#isDbOnline = false;
        }

        // Initialize Circular Doubly Linked List for game sequencing
        this.#initializeGameList();

        // Restore high scores from persistence
        this.#loadLeaderboardData();

        // Initialize central Game Engine
        this.#engine = new GameEngine("gameCanvas");

        // Dynamically build all lobby card selections
        this.#buildLobbyGamesGrid();

        // Set up interactive DOM Event Listeners
        this.#setupDOMListeners();

        // Render leaderboard initially
        this.#updateLeaderboardUI();
    }

    /**
     * Create the circular linked list of 30 games.
     */
    #initializeGameList() {
        this.#gameList = new CircularDoublyLinkedList();

        const gameDefs = [
            { name: "TikTok Balance", Class: BalanceGame, icon: "🥞", color: "#fe2c55", desc: "Gravity Stack Challenge" },
            { name: "Stop the Ball", Class: FallGame, icon: "⚽", color: "#25f4ee", desc: "High-Speed Timing Test" },
            { name: "Water Sort", Class: SortGame, icon: "🧪", color: "#ffff00", desc: "Logic Sorting Puzzle" },
            { name: "4x4 Sudoku", Class: SudokuGame, icon: "🧩", color: "#fe2c55", desc: "Mini Grid Numbers Puzzle" },
            { name: "Memory Match", Class: MemoryGame, icon: "🃏", color: "#25f4ee", desc: "Brain Card Pairs Match" },
            { name: "Neon Spinner", Class: ReactionGame, icon: "⚡", color: "#ffff00", desc: "Lock needle inside green zone" },
            { name: "Math Speed", Class: MathSpeedGame, icon: "🧮", color: "#9c27b0", desc: "True / False Math Battle" },
            { name: "Tap Speed", Class: TapSpeedGame, icon: "👆", color: "#fe2c55", desc: "Button Clicking Countdown" },
            { name: "Color Flood", Class: ColorFloodGame, icon: "🎨", color: "#25f4ee", desc: "Grid Flood Fill Puzzle" },
            { name: "Pattern Copy", Class: PatternCopyGame, icon: "🧠", color: "#ffff00", desc: "Simon Says Colors Order" },
            { name: "Fruit Catch", Class: CatchFruitGame, icon: "🍎", color: "#9c27b0", desc: "Move Basket Catch Fruits" },
            { name: "Perfect Slice", Class: PerfectSliceGame, icon: "🔪", color: "#fe2c55", desc: "Chop Moving logs precisely" },
            { name: "Quick Count", Class: CountDotsGame, icon: "🔢", color: "#25f4ee", desc: "Flash Dots Count Challenge" },
            { name: "Minesweeper", Class: AvoidBombsGame, icon: "💣", color: "#ffff00", desc: "Reveal 13 safe cells, avoid mines" },
            { name: "Target Burst", Class: TargetShooterGame, icon: "🎯", color: "#9c27b0", desc: "Tap shrinking neon bubbles" },
            { name: "Color Match", Class: ColorMatchGame, icon: "🌈", color: "#fe2c55", desc: "Stroop Word Color Matching" },
            { name: "Connect Pipes", Class: ConnectPipesGame, icon: "🚰", color: "#25f4ee", desc: "Rotate tubes fluid routing" },
            { name: "Jump Runner", Class: JumpObstaclesGame, icon: "🏃", color: "#ffff00", desc: "Jump Obstacles Runner" },
            { name: "Neon OX", Class: TicTacToeGame, icon: "❌", color: "#9c27b0", desc: "3x3 Tic Tac Toe vs AI" },
            { name: "Word Scramble", Class: WordScrambleGame, icon: "📝", color: "#fe2c55", desc: "Unscramble Letters Speller" },
            { name: "Knife Target", Class: KnifeThrowGame, icon: "🎯", color: "#25f4ee", desc: "Throw knives target logs" },
            { name: "Whack Mole", Class: WhackAMoleGame, icon: "🐹", color: "#ffff00", desc: "Whack pop-up speed moles" },
            { name: "Rhythm Beats", Class: RhythmTapGame, icon: "🎵", color: "#9c27b0", desc: "Tap Falling columns beats" },
            { name: "Shade Hunter", Class: GridFinderGame, icon: "👁", color: "#fe2c55", desc: "Find Odd shade square" },
            { name: "Block Drop", Class: BlockSliderGame, icon: "📦", color: "#25f4ee", desc: "Align block release gaps" },
            { name: "Operator Finder", Class: OperatorFinderGame, icon: "🎲", color: "#ffff00", desc: "Identify missing equation sign" },
            { name: "Brick Pop", Class: BallBricksGame, icon: "🧱", color: "#9c27b0", desc: "Paddle ball block breaker" },
            { name: "Tap in Order", Class: SequenceOrderGame, icon: "🔟", color: "#fe2c55", desc: "Tap numbers 1 to 5 order" },
            { name: "Grid Escape", Class: MazeEscapeGame, icon: "🚪", color: "#25f4ee", desc: "Maze escape arrow navigation" },
            { name: "Flappy Ball", Class: FlappyBallGame, icon: "🐤", color: "#ffff00", desc: "Tap flap gap pipes physics" }
        ];

        gameDefs.forEach(def => {
            this.#gameList.insert(def);
        });
    }

    /**
     * Populate the lobby grid dynamically with all 30 game buttons.
     */
    #buildLobbyGamesGrid() {
        const grid = document.getElementById("lobbyGamesGrid");
        if (!grid) return;

        grid.innerHTML = ""; // Clear placeholder cards

        const games = this.#gameList.toArray();
        games.forEach((def, index) => {
            const card = document.createElement("button");
            card.className = "game-card";
            card.type = "button";
            
            // Set custom glow highlight style
            card.innerHTML = `
                <div class="card-glow" style="background: ${def.color}"></div>
                <div class="card-icon">${def.icon}</div>
                <div class="card-details">
                    <h2>${def.name}</h2>
                    <p>${def.desc}</p>
                </div>
                <span class="card-action" style="border-color: ${def.color};">PLAY</span>
            `;

            // Hover state styling via javascript inline color transitions
            card.addEventListener('mouseenter', () => {
                const action = card.querySelector('.card-action');
                action.style.background = def.color;
                action.style.color = (def.color === '#ffff00' || def.color === '#25f4ee') ? '#000' : '#fff';
                action.style.boxShadow = `0 0 15px ${def.color}`;
            });
            card.addEventListener('mouseleave', () => {
                const action = card.querySelector('.card-action');
                action.style.background = 'rgba(255, 255, 255, 0.05)';
                action.style.color = 'inherit';
                action.style.boxShadow = 'none';
            });

            card.addEventListener('click', () => {
                // Find node references in Circular List
                let current = this.#gameList.head;
                while (current.value.name !== def.name) {
                    current = current.next;
                }
                this.#runArcade(current);
            });

            grid.appendChild(card);
        });
    }

    /**
     * Setup DOM listener actions.
     */
    #setupDOMListeners() {
        const doc = document;

        const lobbyView = doc.getElementById("lobbyView");
        const gameView = doc.getElementById("gameView");
        const leaderboardView = doc.getElementById("leaderboardView");
        
        const btnShowScores = doc.getElementById("btnShowScores");
        const btnBackFromScores = doc.getElementById("btnBackFromScores");
        const btnBackFromGame = doc.getElementById("btnBackFromGame");
        const btnSubmitName = doc.getElementById("btnSubmitName");
        const nameInput = doc.getElementById("usernameInput");
        const btnOverlayLobby = doc.getElementById("btnOverlayLobby");
        const tempOverlay = doc.getElementById("gameOverOverlay");

        const showView = (targetView) => {
            [lobbyView, gameView, leaderboardView].forEach(v => v.classList.add("hidden"));
            targetView.classList.remove("hidden");
            this.#engine.resizeCanvas();
        };

        btnShowScores.addEventListener('click', () => {
            this.#updateLeaderboardUI();
            showView(leaderboardView);
        });

        btnBackFromScores.addEventListener('click', () => {
            showView(lobbyView);
        });

        btnBackFromGame.addEventListener('click', () => {
            this.#engine.stop();
            showView(lobbyView);
        });

        btnOverlayLobby.addEventListener('click', () => {
            tempOverlay.classList.add("hidden");
            this.#engine.stop();
            showView(lobbyView);
        });

        btnSubmitName.addEventListener('click', () => {
            const inputVal = nameInput.value.trim();
            if (inputVal !== "") {
                this.#currentUsername = inputVal;
                doc.getElementById("currentUserDisplay").innerText = `@${this.#currentUsername}`;
                btnSubmitName.innerText = "SAVED!";
                setTimeout(() => { btnSubmitName.innerText = "SAVE"; }, 1500);
            }
        });
    }
    /**
     * Start running the continuous arcade swiping system.
     */
    #runArcade(startNode) {
        const doc = document;
        const gameView = doc.getElementById("gameView");
        const lobbyView = doc.getElementById("lobbyView");

        // Reset Arcade run total scores and counts
        this.#arcadeTotalScore = 0;
        this.#gamesPlayedCount = 0;

        // Show Game View panel
        lobbyView.classList.add("hidden");
        gameView.classList.remove("hidden");
        this.#engine.resizeCanvas();

        // Build vertical scroll navigation pagination dots once
        this.#buildPaginationDots();

        // Start arcade system inside engine
        this.#engine.setupArcade(
            startNode,
            (score) => this.#handleGameOver(score),
            (metadata) => this.#updateActiveGameUI(metadata)
        );
    }

    /**
     * Render the pagination indicator dots in the DOM container.
     */
    #buildPaginationDots() {
        const dotsContainer = document.getElementById("swipePaginationDots");
        if (!dotsContainer) return;

        dotsContainer.innerHTML = "";
        
        // Render 10 representative dots (30 is too many layout dots to look clean)
        for (let i = 0; i < 10; i++) {
            const dot = document.createElement("div");
            dot.className = "pagination-dot";
            dot.dataset.group = i;
            dotsContainer.appendChild(dot);
        }
    }

    /**
     * Callback triggered by engine whenever active game node changes.
     */
    #updateActiveGameUI(metadata) {
        this.#activeGameName = metadata.name;
        
        // Update DOM texts
        document.getElementById("activeGameTitle").innerText = metadata.name;

        // Track active index based on how many games played
        document.getElementById("activeGameIndex").innerText = `${this.#gamesPlayedCount + 1}/30`;

        // Find active index in game list for pagination group
        let index = 0;
        let current = this.#gameList.head;
        while (current.value.name !== metadata.name) {
            current = current.next;
            index++;
        }

        // Update active dot indicators
        const dots = document.querySelectorAll(".pagination-dot");
        const activeGroup = Math.floor(index / 3); // Map 30 games into 10 dots
        dots.forEach((dot, idx) => {
            if (idx === activeGroup) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    /**
     * Handle Game Over modal and list updates.
     */
    /**
     * Handle Game Over overlay triggers and auto-scrolling loops.
     */
    #handleGameOver(gameScore) {
        this.#engine.stop();

        this.#arcadeTotalScore += gameScore;
        this.#gamesPlayedCount++;

        const doc = document;
        const tempOverlay = doc.getElementById("gameOverOverlay");
        const tempScore = doc.getElementById("tempScoreDisplay");
        const tempTitle = doc.getElementById("tempGameTitle");
        const overlayGlow = doc.getElementById("overlayGlow");
        const overlayStatus = doc.getElementById("overlayStatus");
        const overlayScoreLabel = doc.getElementById("overlayScoreLabel");
        const overlayNextHint = doc.getElementById("overlayNextHint");
        const btnOverlayLobby = doc.getElementById("btnOverlayLobby");

        // Display results inside temporary hud
        tempTitle.innerText = this.#activeGameName;

        if (this.#gamesPlayedCount < 30) {
            // Intermediate game over
            tempScore.innerText = `+${gameScore}`;
            overlayScoreLabel.innerText = "GAME SCORE";
            btnOverlayLobby.classList.add("hidden");
            overlayNextHint.classList.remove("hidden");
            overlayNextHint.innerText = "NEXT GAME IN 1.5s...";

            if (gameScore > 0) {
                overlayStatus.innerText = "CHALLENGE PASSED";
                overlayStatus.style.color = "var(--primary-cyan)";
                overlayStatus.style.textShadow = "0 0 15px rgba(37, 244, 238, 0.6)";
                overlayGlow.style.background = "var(--primary-cyan)";
            } else {
                overlayStatus.innerText = "CHALLENGE FAILED";
                overlayStatus.style.color = "var(--primary-pink)";
                overlayStatus.style.textShadow = "0 0 15px rgba(254, 44, 85, 0.6)";
                overlayGlow.style.background = "var(--primary-pink)";
            }

            // Show temp overlay
            tempOverlay.classList.remove("hidden");

            // Auto-swipe vertical scroll to the next game in 1.5 seconds
            setTimeout(() => {
                tempOverlay.classList.add("hidden");
                this.#engine.triggerSwipeNext();
            }, 1500);
        } else {
            // 30th game complete! Arcade run complete
            tempScore.innerText = `${this.#arcadeTotalScore}`;
            overlayScoreLabel.innerText = "TOTAL ARCADE SCORE";
            overlayNextHint.classList.add("hidden");
            btnOverlayLobby.classList.remove("hidden");

            overlayStatus.innerText = "ARCADE RUN COMPLETE!";
            overlayStatus.style.color = "var(--primary-yellow)";
            overlayStatus.style.textShadow = "0 0 15px rgba(255, 255, 0, 0.6)";
            overlayGlow.style.background = "var(--primary-yellow)";

            // Asynchronously save total score to local & database collections
            this.#saveScore(this.#currentUsername, this.#arcadeTotalScore);

            // Show temp overlay
            tempOverlay.classList.remove("hidden");
        }
    }

    /**
     * Save score locally and sync to Firebase Firestore database.
     * Showcase: Real-time Cloud saving with local fallback.
     */
    async #saveScore(username, score) {
        // 1. Write locally first to ensure data protection
        this.#leaderboard.insertSorted(username, score);
        this.#saveLeaderboardData();

        // 2. Upload to database asynchronously if online
        if (this.#isDbOnline) {
            try {
                await addDoc(collection(this.#db, "leaderboard"), {
                    name: username,
                    score: score,
                    timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                    epoch: Date.now()
                });
                console.log("Score synced to Cloud Database!");
                // Reload global leaderboard
                await this.#loadLeaderboardData();
            } catch (e) {
                console.warn("Cloud save failed. Offline changes queued locally.", e);
            }
        } else {
            this.#updateLeaderboardUI();
        }
    }

    /**
     * Restore leaderboards from Cloud Database or Local Storage.
     * Showcase: Serialization and Deserialization.
     */
    async #loadLeaderboardData() {
        if (this.#isDbOnline) {
            try {
                // Fetch top 10 scores from Firestore ordered by score descending
                const q = query(collection(this.#db, "leaderboard"), orderBy("score", "desc"), limit(10));
                const querySnapshot = await getDocs(q);
                
                this.#leaderboard.clear();
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    this.#leaderboard.insertSorted(data.name, data.score);
                });
                
                this.#updateLeaderboardUI();
                return; // Fetch complete
            } catch (e) {
                console.warn("Failed to retrieve leaderboard from Firestore. Falling back to Local Storage.", e);
            }
        }

        // Local Storage fallback
        try {
            const dataStr = localStorage.getItem(this.#storageKey);
            if (dataStr) {
                const rawArr = JSON.parse(dataStr);
                if (Array.isArray(rawArr)) {
                    this.#leaderboard.clear();
                    rawArr.forEach(item => {
                        this.#leaderboard.insertSorted(item.name, item.score);
                    });
                }
            } else {
                // Populate seed data
                this.#leaderboard.insertSorted("Charli_D", 85);
                this.#leaderboard.insertSorted("Khaby_L", 62);
                this.#leaderboard.insertSorted("Bella_P", 35);
                this.#saveLeaderboardData();
            }
            this.#updateLeaderboardUI();
        } catch (e) {
            console.error("Failed to load leaderboard data.", e);
        }
    }

    /**
     * Serialize LinkedList scores and write to localStorage.
     */
    #saveLeaderboardData() {
        try {
            const listArr = this.#leaderboard.toArray();
            localStorage.setItem(this.#storageKey, JSON.stringify(listArr));
        } catch (e) {
            console.error("Failed to save leaderboard data.", e);
        }
    }

    /**
     * Re-renders the leaderboard list with database connectivity status badges.
     * Showcase: Traversing dynamic Linked List and building HTML nodes.
     */
    #updateLeaderboardUI() {
        const listContainer = document.getElementById("leaderboardContainer");
        listContainer.innerHTML = "";

        // Update database connection status indicator badge
        const dbBadge = document.getElementById("dbStatusBadge");
        if (dbBadge) {
            if (this.#isDbOnline) {
                dbBadge.innerText = "GLOBAL LIVE";
                dbBadge.className = "db-status-badge online";
            } else {
                dbBadge.innerText = "LOCAL OFFLINE";
                dbBadge.className = "db-status-badge offline";
            }
        }

        const scores = this.#leaderboard.toArray();

        if (scores.length === 0) {
            listContainer.innerHTML = `<li class="empty-list">No scores yet. Start playing!</li>`;
            return;
        }

        scores.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "leaderboard-item";
            
            let badge = `#${index + 1}`;
            if (index === 0) badge = "🥇";
            else if (index === 1) badge = "🥈";
            else if (index === 2) badge = "🥉";

            li.innerHTML = `
                <div class="score-rank-name">
                    <span class="rank-badge">${badge}</span>
                    <span class="player-name">@${item.name}</span>
                </div>
                <div class="score-details">
                    <span class="score-value">${item.score} pts</span>
                    <span class="score-date">${item.timestamp.split(' ')[1] || ''}</span>
                </div>
            `;
            
            listContainer.appendChild(li);
        });
    }
}

// Entry Point: DOM Content Loaded initialization
document.addEventListener("DOMContentLoaded", () => {
    // Dynamic initialization in heap
    new App();
});

