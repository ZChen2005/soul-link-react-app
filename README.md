# Pokemon Soul Link Tracker

React (Create React App) front end with three screens: Home, New Game, Load Game.

## Run it

```bash
npm install
npm start
```

Then open http://localhost:3000.

## Structure

- `src/pages/Home.js` – New Game / Load Game buttons
- `src/pages/NewGame.js` – name, game picker, number of players, player name boxes
- `src/pages/LoadGame.js` – saved games with Load and Delete
- `src/pages/GamePage.js` – placeholder for the encounters, boxes, links and summary pages
- `src/data/regions.js` – regions and their games
- `src/storage.js` – saves games in the browser's localStorage
