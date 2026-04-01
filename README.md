# Grid Survival Challenge

`Grid Survival Challenge` is a browser-based arcade grid game built with React, ReactDOM, Babel-in-the-browser, and a canvas-rendered board. The UI uses a premium dark gaming theme with animated overlays, glow effects, local score tracking, and two dynamically generated patterns.

## Tech Stack

- `index.html` bootstraps the app and loads React 18, ReactDOM 18, Babel, Google Fonts, and the main stylesheet
- `script.js` contains the full React app, gameplay logic, pattern generation, overlays, and canvas rendering
- `style.css` contains the premium game UI styling, themes, animations, HUD, overlays, and responsive layout rules

## Current Gameplay

- Minimum board size: `10 x 10`
- Default board size: `10 x 10`
- Two dynamic patterns:
  - `Pattern 1`
  - `Pattern 2`
- Pattern 1 automatically transitions into Pattern 2 after all blue tiles are cleared
- Manual pattern switching is also available from the pattern buttons

## Tile Types

- Blue tile:
  - Gives points
  - Increases combo
  - Has glow animation
- Red tile:
  - Blinks white and red after click
  - Removes `1` life
  - Resets combo
- Green tile:
  - Safe tile
  - Clears on click
  - Resets combo
- Dark tile:
  - Inactive board filler
  - Can be temporarily highlighted by Scan Pulse

## Rules

- Starting lives: `5`
- Timer depends on selected difficulty
- Win condition:
  - Clear all blue tiles in both patterns before time/lives run out
- Lose condition:
  - Timer reaches `0`
  - Lives reach `0`

## Difficulty Settings

- `Easy`
  - `38s` timer
  - `3` scan charges
- `Normal`
  - `30s` timer
  - `2` scan charges
- `Hard`
  - `24s` timer
  - `1` scan charge

Pattern 2 starts with a slightly shorter timer than Pattern 1.

## Scoring

- Blue tile score = `10 x combo`
- Final score includes:
  - collected points
  - time bonus
  - life bonus
  - combo bonus
  - difficulty bonus on a full clear

The game stores:

- Best score in `localStorage`
- Last run summary in `localStorage`

## Features

- Start screen overlay
- How-to-play overlay
- Difficulty selection overlay
- Animated loading screen
- Countdown before gameplay: `3, 2, 1, GO!`
- Canvas-rendered board
- Hover scale effect on active tiles
- Click ripple effect
- Red danger blink effect
- Confetti on win
- Shake effect on loss
- Theme switcher:
  - `Neon`
  - `Cyber`
  - `Retro`
- Scan Pulse ability to brighten dark lanes temporarily
- Sound feedback for collecting and danger hits
- Keyboard shortcut:
  - `Space` to start again from start/result screens
  - `H` to open How to Play from the start screen

## Layout Notes

- Desktop layout uses a left sidebar and right gameplay stage
- Desktop scrolling is enabled
- Mobile layout stacks the interface into a single column
- The canvas board scales based on the current row and column count
- Tile spacing and number visibility adapt for larger boards to reduce overlap

## How To Run

Because the app loads React, ReactDOM, Babel, and Google Fonts from CDNs, run it through a local web server and keep internet access enabled.

### Option 1: Use your current PHP server

Open the project through your PHP server and load [index.html].

### Option 2: Open with another local server

Serve the project folder with any static server, then open the app in your browser.

## How To Play

1. Open the app in the browser.
2. Choose rows and columns if needed.
3. Click `Start Game`.
4. Optionally check `How to Play` or `Difficulty` first.
5. Wait for the countdown.
6. Click blue tiles to score.
7. Avoid red tiles.
8. Use green tiles carefully because they reset combo.
9. Clear Pattern 1 to move into Pattern 2.
10. Finish both patterns to win.

## Project Structure

- [index.html](/c:/Users/suman/OneDrive/Desktop/fog%20project/project2/index.html)
- [style.css](/c:/Users/suman/OneDrive/Desktop/fog%20project/project2/style.css)
- [script.js](/c:/Users/suman/OneDrive/Desktop/fog%20project/project2/script.js)
- [README.md](/c:/Users/suman/OneDrive/Desktop/fog%20project/project2/README.md)

## Important Notes

- This version is not using a bundler such as Vite or Webpack
- JSX is compiled in the browser through Babel
- The board is rendered on `canvas`, not with HTML grid cells
- Pattern generation is procedural and dynamic, not fixed from video frames
