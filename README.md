# ReptiMind Exotic Pet App

ReptiMind is a Vite + React prototype for exotic pet care. It simulates pet health monitoring, device controls, alert notifications, AI chat, a reptile community, a shop, and a user profile page.

## Features

- Home dashboard with pet status, temperature/humidity data, feeding reminders, light schedule, and alert inbox
- Devices page with simulated camera view, moving pet preview, sensors, manual controls, and care settings
- Floating AI assistant and full AI chat history page
- Community feed with image posting demo
- Shop page with product pagination and interactive cart
- User profile page with pet profiles, subscription settings, preferences, support, and chat history entry

## Requirements

Before running the project, install:

- [Node.js LTS](https://nodejs.org/)
- npm, which is included with Node.js

To check whether they are installed:

```bash
node -v
npm -v
```

## Installation

Clone or download this repository, then open a terminal in the project folder:

```bash
cd exotic-pet-app
npm install
```

`npm install` downloads the project dependencies listed in `package.json`, such as React and Vite.

## Run The Frontend

Start the Vite development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal. It is usually:

```text
http://localhost:5173/
```

Main routes:

```text
/           Home
/devices    Devices
/community  Community
/shop       Shop
/user       User profile
/chat       AI chat history
/premium    Premium subscription demo
```

## Optional Backend Server

The app can run as a visual prototype with only `npm run dev`.

For local AI chat API calls and JSON-file persistence, open a second terminal and run:

```bash
cd exotic-pet-app
npm run server
```

The backend server runs at:

```text
http://127.0.0.1:3001
```

It stores local demo data in:

```text
local-data/
```

This includes custom pets, deleted built-in pet IDs, and chat sessions.

## AI Chat Setup

The backend expects a DeepSeek API key if you want live AI replies.

Create a `.env` file in the project root:

```text
DEEPSEEK_API_KEY=your_api_key_here
```

Without this key, the app still works as a prototype and uses fallback demo replies.

## Build For Production

To create a production build:

```bash
npm run build
```

The built files will be generated in:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

## Deploy To Vercel

This project includes `vercel.json` so browser refresh works on routes like `/shop` and `/user`.

Typical deployment flow:

```bash
git add .
git commit -m "update reptimind prototype"
git push
```

Then connect the GitHub repository to Vercel. Vercel should use:

```text
Build command: npm run build
Output directory: dist
```

## Project Structure

```text
exotic-pet-app/
|-- public/
|   |-- pets/          Pet images used by the app
|   `-- shop/          Shop product images
|-- src/
|   |-- components/    Shared UI components
|   |-- data/          Mock pet data and simulator logic
|   |-- pages/         App pages
|   |-- App.jsx        Main app shell and routing
|   `-- App.css        App styling
|-- server.js          Optional local backend server
|-- package.json       Scripts and dependencies
`-- vercel.json        Vercel route rewrite config
```

## Notes

- The app does not use a real database. It uses mock data, browser local storage, and optional local JSON files.
- Do not upload `node_modules/` to GitHub.
- Product and pet images used by the website are inside `public/`, not the external `picture` folder.
- If the frontend does not open, make sure Node.js is installed and run `npm install` again.
