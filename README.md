# ClassForge — UML Class Diagram Generator

A React + Vite web application for creating UML class diagrams and generating Java class skeletons.

## Features
- Add, select, edit, and delete UML classes
- Add attributes with visibility and data types
- Add methods with visibility, parameters, and return types
- Drag classes around the diagram canvas
- Create associations, inheritance, composition, and dependency relationships
- Preview generated Java source
- Copy Java code or download `GeneratedClasses.java`
- Export the diagram as SVG

## Run locally
1. Install Node.js (18+ recommended).
2. Extract this ZIP.
3. Open a terminal in this project folder.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local URL printed by Vite (usually http://localhost:5173).

## Build
```bash
npm run build
npm run preview
```

Note: This starter generates Java class skeletons. Relationship connectors are visual annotations; relationship fields/imports are not inferred automatically. Add constructors, getters, setters, and method implementations as needed.
