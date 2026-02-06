# Wordle

A web-based implementation of Wordle!

## How to Play

1. Clone this repository
2. Open `index.html` in a web browser

### Gameplay
- Guess a 5-letter word by typing letters
- Press **Enter** to submit your guess
- Use **Backspace** to delete letters
- You have 6 guesses to find the word

### Color Feedback

- 🟩 **Green**: Letter is correct and in the right position
- 🟨 **Yellow**: Letter is in the word but in the wrong position
- ⬛ **Gray**: Letter is not in the word

The on-screen keyboard updates to show which letters you've tried.

## Code Structure

- `index.html` - Main HTML file that loads the game
- `Wordle.js` - Core game logic and rendering
- `GKeyboard.js` - Interactive keyboard component
- `dictionaries/` - Word lists for validation and random word selection
