# Grid Survival Challenge

## Run

1. Start a local server in the project folder, or use your current PHP server.
2. Open [index.html](c:\Users\suman\OneDrive\Desktop\fog project\project2\index.html) in the browser.
3. The app loads React from CDN and runs the game through a React + canvas architecture.
4. Set rows and columns, then click `Generate`.

## Game Rules

- Lives: `5`
- Timer depends on difficulty
- Blue tile: adds score
- Red tile: flashes white/red and removes one life
- Green tile: safe
- Win: clear all blue tiles
- Lose: timer reaches `0` or lives reach `0`
- Final score: points + time bonus + life bonus + combo bonus

## Notes

- The game board is rendered on `canvas`, not as an HTML tile grid.
- UI state and gameplay flow are managed in React.
- Pattern 1 and Pattern 2 are dynamically generated for any grid size `10 x 10` or larger.
- Includes a start screen, how-to-play overlay, difficulty selector, local best score, countdown, sound effects, scan pulse ability, and win confetti.
