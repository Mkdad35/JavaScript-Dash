# JavaScript-Dash
A full-stack, dependency-free Geometry Dash arcade clone and stage builder. Features vanilla JS canvas-alternative mechanics, multi-state physics engines (Cube, Ship, Ball), a dynamic hazard proximity system, and a custom native Node.js static asset server.
# 🚀 JS Dash: Side-Scrolling Platformer & Level Editor

A precision, side-scrolling arcade platformer inspired by Geometry Dash. Built using clean separation of concerns, the project features responsive player mode transitions, a proximity-based warning vignette system, and a fully functional layout builder that lets users draw, test, export, and import custom maps. The entire frontend is served via a custom-engineered native Node.js HTTP backend server.

### ⚙️ Core Architecture & Features
*   **Tri-Modal Physics Engine:** Dynamic physics rules handling traditional grid jumping (Cube), thrust velocity bounds (Ship), and variable runtime gravity inversion (Ball).
*   **Proximity Threat Detection:** A mathematical lookahead system calculating distances to upcoming active hazards, dynamically driving UI/UX vignette alpha levels and pulse behaviors based on player safety.
*   **Interactive Level Editor:** A comprehensive drag-and-drop canvas layout panel mapping obstacle objects to custom grid sizes, equipped with real-time testing pipelines, stage parameter configuration, and native JSON load/export mechanisms.
*   **Custom Node.js Asset Server:** Built a zero-dependency local backend using native HTTP interfaces, custom asynchronous file streaming pipelines (`node:fs/promises`), and dynamic Content-Type lookup parsing to serve asset hierarchies cleanly.

### 🛠️ Tech Stack
*   **Frontend:** HTML5 (Semantic Architecture), CSS3 (Advanced transforms, absolute coordinate calculations, webkit rendering rules), Vanilla JavaScript (ES6 Modules, DOM Injection).
*   **Backend:** Node.js (Native HTTP module, fs filesystem stream orchestration).
*   **Data Representation:** JSON serialized state objects for puzzle stages.

---


---

