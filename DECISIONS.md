# Architecture & Design Decisions - Focus Personal Task Manager

This document outlines the key technical decisions made during the design and implementation of the **Focus Personal Task Manager** application.

---

## 1. Why SQLite?

- **Zero Configuration & Lightweight**: Unlike full-scale engines (PostgreSQL, MySQL), SQLite does not require a background service, configuration files, or database administration. It runs in-process, reading and writing directly to a single disk file (`focus.db`).
- **Single User Target**: The application's goal is to serve a single user managing daily tasks. Concurrent write scaling is unnecessary, making SQLite’s file-level locking behavior perfectly acceptable and highly performant.
- **Easy Persistence**: Tasks and goals remain persistent across app restarts, system restarts, and code changes without introducing server setup complexity.

---

## 2. Why No Authentication?

- **MVP Priority**: The product requirements document targets an individual developer or user running a local instance of the application. High-overhead user registration flows and session cookie handlers would distract from the core value proposition: **speed of adding tasks** and **simple organization**.
- **Performance**: Eliminating the auth gateway and token validation checks keeps the latency of critical endpoints (like creating or toggling tasks) under 10ms, making task capture instantaneous.
- **Simplicity**: No admin panel or sharing means a clean codebase that acts as a single-tenant workspace.

---

## 3. Tech Stack Choices & Implementation Details

- **Native SQL parameter binding (sqlite3 module directly)**: We avoided ORMs like Prisma or Sequelize to eliminate dependency weight and startup overhead. We used SQL parameters (`?`) for all queries, ensuring the app is immune to SQL injection attacks. We wrapped callbacks in Promise helpers (`dbRun`, `dbGet`, `dbAll`) to support clean, modern `async/await` syntax in the controllers.
- **Tailwind CSS v4 (Vite plugin)**: Enabled Tailwind v4 using `@tailwindcss/vite` in `vite.config.js`. This allows styling directly in CSS using `@import "tailwindcss";` without complex Tailwind config scripts, matching Vite 8 and React 19 standards.
- **Native Fetch Client wrapper (`api.js`)**: Consolidating requests in a single file ensures we don't repeat URL concatenation, JSON serialization, and error handling across components. It follows the requirement to avoid Axios.
- **Natural Language Parsing (NLP) in `taskParser.js`**: Built a lightweight, deterministic parser using RegEx matching and Javascript local date computations. It handles:
  - Relative dates: `today`, `tomorrow`, `next <weekday>`, `<weekday>`
  - Priorities: `!high`/`p1`, `!med`/`p2`, `!low`/`p3`
  - Text cleaning: Extracts date/priority tags and returns a sanitized title for the task card.

---

## 4. Future Improvements

If the project expands beyond a local MVP, the following improvements would be prioritized:

1. **User Accounts & Cloud Sync**: Add Firebase, Auth0, or custom JWT authentication to allow users to access their task manager across multiple devices, synching SQLite data to a cloud database (e.g., PostgreSQL or MongoDB).
2. **AI-Powered Semantic Parser**: Replace the RegEx-based natural language parser in `utils/taskParser.js` with an LLM API integration (e.g., Gemini API via the `@google/generative-ai` SDK). This would allow semantic date parsing (like "email boss in two weeks", "buy gift before Christmas") and automatic subtask generation.
3. **Subtasks & Dependencies**: Enable breakdown of tasks into checklists/subtasks and specify prerequisites (e.g., "Task B requires Task A to be completed first").
4. **Keyboard-Only Navigation**: Add shortcuts (e.g., press `/` to focus the input box, `j`/`k` to navigate task cards, `Space` to toggle completeness) for power-user speed.
