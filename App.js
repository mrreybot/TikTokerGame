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
import { LinkedList } from './DataStructures.js';
import { BalanceGame } from './games/BalanceGame.js';
import { FallGame } from './games/FallGame.js';
import { SortGame } from './games/SortGame.js';

class App {
    // Encapsulated states (PL Concept 5)
    #engine = null;
    #leaderboard = null;
    #currentUsername = "TikToker";
    #activeGameName = "";
    #storageKey = "tiktok_arcade_leaderboard_v1";

    constructor() {
        // Initialize dynamic sorted LinkedList for storing high scores (PL Concept 6)
        this.#leaderboard = new LinkedList(10); // cap top 10 scores
        
        // Restore existing high scores from persistence (localStorage serialization)
        this.#loadLeaderboardData();

        // Initialize central Game Engine
        this.#engine = new GameEngine("gameCanvas");

        // Set up interactive DOM Event Listeners (PL Elective Concept 1: Event-driven design)
        this.#setupDOMListeners();

        // Render initially
        this.#updateLeaderboardUI();
    }

    /**
     * Restore leaderboards from localStorage.
     * Showcase: Serialization and Deserialization.
     */
    #loadLeaderboardData() {
        try {
            const dataStr = localStorage.getItem(this.#storageKey);
            if (dataStr) {
                const rawArr = JSON.parse(dataStr);
                // Run-time validation check (PL Concept 7)
                if (Array.isArray(rawArr)) {
                    // Loop to reconstruct nodes inside the heap (PL Concept 3 Heap)
                    rawArr.forEach(item => {
                        this.#leaderboard.insertSorted(item.name, item.score);
                    });
                }
            } else {
                // Pre-populate with default scores for aesthetics if empty
                this.#leaderboard.insertSorted("Charli_D", 85);
                this.#leaderboard.insertSorted("Khaby_L", 62);
                this.#leaderboard.insertSorted("Bella_P", 35);
                this.#saveLeaderboardData();
            }
        } catch (e) {
            console.error("Failed to load leaderboard data.", e);
        }
    }

    /**
     * Serialize LinkedList scores and write to localStorage.
     */
    #saveLeaderboardData() {
        try {
            // Convert list node chain to array and stringify
            const listArr = this.#leaderboard.toArray();
            localStorage.setItem(this.#storageKey, JSON.stringify(listArr));
        } catch (e) {
            console.error("Failed to save leaderboard data.", e);
        }
    }

    /**
     * Register browser click/navigation inputs.
     */
    #setupDOMListeners() {
        const doc = document;

        // View selectors
        const lobbyView = doc.getElementById("lobbyView");
        const gameView = doc.getElementById("gameView");
        const leaderboardView = doc.getElementById("leaderboardView");
        
        // Buttons
        const btnShowScores = doc.getElementById("btnShowScores");
        const btnBackFromScores = doc.getElementById("btnBackFromScores");
        const btnBackFromGame = doc.getElementById("btnBackFromGame");
        const btnSubmitName = doc.getElementById("btnSubmitName");
        const nameInput = doc.getElementById("usernameInput");
        
        // Game launcher cards
        const cardBalance = doc.getElementById("cardBalance");
        const cardFall = doc.getElementById("cardFall");
        const cardSort = doc.getElementById("cardSort");

        // Navigation Procedures (PL Concept 1: Procedures)
        const showView = (targetView) => {
            [lobbyView, gameView, leaderboardView].forEach(v => v.classList.add("hidden"));
            targetView.classList.remove("hidden");
            this.#engine.resizeCanvas(); // Ensure coordinates recalculate
        };

        // Event-driven navigation toggles (PL Elective Concept 1)
        btnShowScores.addEventListener('click', () => {
            this.#updateLeaderboardUI();
            showView(leaderboardView);
        });

        btnBackFromScores.addEventListener('click', () => {
            showView(lobbyView);
        });

        btnBackFromGame.addEventListener('click', () => {
            // Stop loop and return to lobby
            this.#engine.stop();
            showView(lobbyView);
        });

        // User profile settings
        btnSubmitName.addEventListener('click', () => {
            const inputVal = nameInput.value.trim();
            // Input Validation (PL Concept 7)
            if (inputVal !== "") {
                this.#currentUsername = inputVal;
                doc.getElementById("currentUserDisplay").innerText = `@${this.#currentUsername}`;
                
                // Show tiny success feedback
                btnSubmitName.innerText = "SAVED!";
                setTimeout(() => { btnSubmitName.innerText = "SAVE"; }, 1500);
            }
        });

        // Game Instantiation triggers (PL Concept 3 Heap allocation & Elective 2 Polymorphism)
        const runGameInstance = (GameClass, name) => {
            this.#activeGameName = name;
            showView(gameView);

            // Callback closures for Game Over sequence
            // Showcase: PL Concept 2 (Lexical closure preserves context reference to App this)
            const onGameOverHandler = (finalScore) => {
                this.#handleGameOver(finalScore);
            };

            // Allocate concrete game object dynamically on the Heap (Polymorphism)
            const gameObj = new GameClass(this.#engine, onGameOverHandler);
            
            // Run loop
            this.#engine.runGame(gameObj);
        };

        cardBalance.addEventListener('click', () => runGameInstance(BalanceGame, "TikTok Balance"));
        cardFall.addEventListener('click', () => runGameInstance(FallGame, "Stop the Ball"));
        cardSort.addEventListener('click', () => runGameInstance(SortGame, "Water Sort"));
    }

    /**
     * Handle Game Over modal and list updates.
     */
    #handleGameOver(finalScore) {
        this.#engine.stop();

        const doc = document;
        const modal = doc.getElementById("gameOverModal");
        const scoreDisplay = doc.getElementById("finalScoreDisplay");
        const gameTitleDisplay = doc.getElementById("modalGameTitle");
        const btnRestart = doc.getElementById("btnModalRestart");
        const btnLobby = doc.getElementById("btnModalLobby");

        // Display results
        gameTitleDisplay.innerText = this.#activeGameName;
        scoreDisplay.innerText = finalScore;

        // Insert new score node into LinkedList (PL Concept 6)
        this.#leaderboard.insertSorted(this.#currentUsername, finalScore);
        this.#saveLeaderboardData();
        this.#updateLeaderboardUI();

        // Show modal overlay
        modal.classList.remove("hidden");

        // Button events with closure binds
        const cleanupModalEvents = () => {
            modal.classList.add("hidden");
            // Re-create buttons to clear listeners and avoid memory leaking
            const newBtnRestart = btnRestart.cloneNode(true);
            const newBtnLobby = btnLobby.cloneNode(true);
            btnRestart.parentNode.replaceChild(newBtnRestart, btnRestart);
            btnLobby.parentNode.replaceChild(newBtnLobby, btnLobby);
            return { restart: newBtnRestart, lobby: newBtnLobby };
        };

        const restartCallback = () => {
            const btns = cleanupModalEvents();
            // Re-instantiate game
            let GameClass;
            if (this.#activeGameName === "TikTok Balance") GameClass = BalanceGame;
            else if (this.#activeGameName === "Stop the Ball") GameClass = FallGame;
            else GameClass = SortGame;

            const gameObj = new GameClass(this.#engine, (s) => this.#handleGameOver(s));
            this.#engine.runGame(gameObj);
        };

        const lobbyCallback = () => {
            cleanupModalEvents();
            doc.getElementById("gameView").classList.add("hidden");
            doc.getElementById("lobbyView").classList.remove("hidden");
        };

        btnRestart.onclick = restartCallback;
        btnLobby.onclick = lobbyCallback;
    }

    /**
     * Re-renders the leaderboard list.
     * Showcase: Traversing dynamic Linked List and building HTML nodes.
     */
    #updateLeaderboardUI() {
        const listContainer = document.getElementById("leaderboardContainer");
        listContainer.innerHTML = ""; // Clear existing

        const scores = this.#leaderboard.toArray();

        if (scores.length === 0) {
            listContainer.innerHTML = `<li class="empty-list">No scores yet. Start playing!</li>`;
            return;
        }

        scores.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "leaderboard-item";
            
            // Add custom medals for top 3
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
