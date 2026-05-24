/**
 * DataStructures.js
 * 
 * Demonstrates:
 * - PL Concept 4: User-defined Types (ES6 Classes acting as Abstract Data Types).
 * - PL Concept 5: Abstraction and Encapsulation (#private fields and public API).
 * - PL Concept 6: Dynamic Data Structures (Manual Stack & LinkedList).
 * - PL Concept 3: Dynamic Memory / Heap Allocation (Dynamic Node instantiation at runtime).
 * - PL Concept 7: Type Usage & Run-time Type Validation.
 * - PL Concept 10: Exception Handling (Throwing error conditions).
 */

/**
 * Class representing a Node in a singly linked data structure.
 * Showcase: PL Concept 3 (Heap Allocation via dynamic instantiation)
 * and PL Concept 4 (User-defined Type).
 */
export class Node {
    constructor(value) {
        // Heap allocation occurs here when 'new Node()' is executed
        this.value = value; 
        this.next = null; // Memory reference to next node (pointer representation in JS)
    }
}

/**
 * Class representing a Custom Stack (LIFO - Last In First Out).
 * Showcase: PL Concept 5 (Encapsulation via private fields #top and #size).
 * Showcase: PL Concept 6 (Dynamic Data Structure without using native Array methods).
 */
export class Stack {
    // Encapsulation: Private fields protect the internal state from external tampering.
    #top = null;
    #size = 0;
    #limit;

    constructor(limit = Infinity) {
        // Runtime Type Validation (PL Concept 7)
        if (typeof limit !== 'number') {
            throw new TypeError("Stack limit must be a number");
        }
        this.#limit = limit;
    }

    /**
     * Push an element onto the stack.
     * Showcase: PL Concept 3 (Heap usage) and PL Concept 10 (Exception Handling).
     */
    push(value) {
        // Run-time Validation (PL Concept 7)
        if (value === undefined || value === null) {
            throw new Error("Cannot push null or undefined values to stack.");
        }

        // Exception Handling (PL Concept 10): Boundary check for stack overflow
        if (this.#size >= this.#limit) {
            throw new Error("Stack Overflow: Maximum stack capacity reached.");
        }

        // Dynamic Heap Memory Allocation: Instantiating a new node
        const newNode = new Node(value);
        
        // Adjusting pointers
        newNode.next = this.#top;
        this.#top = newNode;
        this.#size++;
    }

    /**
     * Pop an element off the stack.
     * Showcase: PL Concept 10 (Exception Handling).
     */
    pop() {
        // Exception Handling (PL Concept 10): Boundary check for stack underflow
        if (this.isEmpty()) {
            throw new Error("Stack Underflow: Cannot pop from an empty stack.");
        }

        // Memory Reference manipulation
        const poppedNode = this.#top;
        this.#top = poppedNode.next;
        this.#size--;

        // Returned value (poppedNode is now unreferenced and eligible for JS Garbage Collection)
        return poppedNode.value;
    }

    /**
     * Look at the top element without removing it.
     */
    peek() {
        if (this.isEmpty()) {
            throw new Error("Stack is empty. Cannot peek.");
        }
        return this.#top.value;
    }

    /**
     * Check if stack is empty.
     */
    isEmpty() {
        return this.#top === null;
    }

    /**
     * Getter for size.
     * Showcase: PL Concept 5 (Abstraction/Encapsulation - exposes size but hides mutator).
     */
    get size() {
        return this.#size;
    }

    /**
     * Convert stack to array representation from top to bottom (for UI rendering).
     * Showcase: PL Concept 1 (Modular procedure).
     */
    toArray() {
        const result = [];
        let current = this.#top;
        while (current !== null) {
            result.push(current.value);
            current = current.next;
        }
        return result;
    }

    /**
     * Clear all elements.
     */
    clear() {
        this.#top = null;
        this.#size = 0;
    }
}

/**
 * Class representing a Node in the Leaderboard LinkedList.
 * Showcase: PL Concept 4 (User-defined type).
 */
export class ScoreNode {
    constructor(name, score) {
        // Run-time Validation (PL Concept 7)
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error("Invalid name type. Must be non-empty string.");
        }
        if (typeof score !== 'number' || isNaN(score)) {
            throw new Error("Invalid score type. Must be a number.");
        }

        this.name = name;
        this.score = score;
        this.timestamp = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        this.next = null;
    }
}

/**
 * Custom Linked List representation for a sorted high score leaderboard.
 * Keeps scores in descending order.
 * Showcase: PL Concept 6 (Dynamic Data Structure) and PL Concept 5 (Encapsulation).
 */
export class LinkedList {
    #head = null;
    #size = 0;
    #maxSize;

    constructor(maxSize = 10) {
        this.#maxSize = maxSize;
    }

    /**
     * Insert a high score in the sorted position (descending).
     * Showcase: PL Concept 3 (Dynamic Heap allocation) and PL Concept 6 (Linked List traversal).
     */
    insertSorted(name, score) {
        const newNode = new ScoreNode(name, score);

        // Case 1: List is empty or new score is higher than current head (Insert at beginning)
        if (this.#head === null || score > this.#head.score) {
            newNode.next = this.#head;
            this.#head = newNode;
            this.#size++;
            this.#trimList();
            return;
        }

        // Case 2: Traverse list to find insertion point (Insert in middle or end)
        let current = this.#head;
        while (current.next !== null && current.next.score >= score) {
            current = current.next;
        }

        newNode.next = current.next;
        current.next = newNode;
        this.#size++;

        this.#trimList();
    }

    /**
     * Dynamic clean-up/trimming of list to limit sizes.
     * Showcase: PL Concept 3 (Letting unused heap objects be garbage collected).
     */
    #trimList() {
        if (this.#size <= this.#maxSize) return;

        let current = this.#head;
        // Traverse to the maximum index node (e.g. 10th node)
        for (let i = 1; i < this.#maxSize; i++) {
            if (current !== null) {
                current = current.next;
            }
        }

        // Sever the link. The remaining nodes (11th and beyond) will lose reference.
        // In PL terms, this makes them unreachable from root, triggering Garbage Collection (Heap reclamation).
        if (current !== null) {
            current.next = null;
        }
        this.#size = this.#maxSize;
    }

    /**
     * Get the head of the list.
     */
    get head() {
        return this.#head;
    }

    /**
     * Get total nodes.
     */
    get size() {
        return this.#size;
    }

    /**
     * Convert linked list to Javascript Array for rendering.
     */
    toArray() {
        const result = [];
        let current = this.#head;
        while (current !== null) {
            result.push({
                name: current.name,
                score: current.score,
                timestamp: current.timestamp
            });
            current = current.next;
        }
        return result;
    }

    /**
     * Clear list.
     */
    clear() {
        this.#head = null;
        this.#size = 0;
    }
}
