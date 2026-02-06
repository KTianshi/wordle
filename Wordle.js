/*
 * File: Wordle.js
 * -----------------
 * This program implements the Wordle game.
 */
"use strict";
/**
 * GAME RULES CONSTANTS
 * ---------------------
 */
const NUM_LETTERS = 5;  // The number of letters in each guess 
const NUM_GUESSES = 6;  // The number of guesses the player has to win

/**
 * SIZING AND POSITIONING CONSTANTS
 * --------------------------------
 */
const SECTION_SEP = 32; // The space between the grid, alert, and keyboard sections
const GUESS_MARGIN = 8; // The space around each guess square
const GWINDOW_WIDTH = 400;  // The width of the GWindow

// The size of each guess square (computed to fill the entire GWINDOW_WIDTH)
const GUESS_SQUARE_SIZE =
  (GWINDOW_WIDTH - GUESS_MARGIN * 2 * NUM_LETTERS) / NUM_LETTERS;

// Height of the guess section in total
const GUESS_SECTION_HEIGHT =
  GUESS_SQUARE_SIZE * NUM_GUESSES + GUESS_MARGIN * NUM_GUESSES * 2;

// X and Y position where alerts should be centered
const ALERT_X = GWINDOW_WIDTH / 2;
const ALERT_Y = GUESS_SECTION_HEIGHT + SECTION_SEP;

// X and Y position to place the keyboard
const KEYBOARD_X = 0;
const KEYBOARD_Y = ALERT_Y + SECTION_SEP;

// GWINDOW_HEIGHT calculated to fit everything perfectly.
const GWINDOW_HEIGHT = KEYBOARD_Y + GKeyboard.getHeight(GWINDOW_WIDTH);


/**
 * STYLISTIC CONSTANTS
 * -------------------
 */
const COLORBLIND_MODE = false; // If true, uses R/G colorblind friendly colors

// Background/Border Colors
const BORDER_COLOR = "#3A3A3C"; // Color for border around guess squares
const BACKGROUND_DEFAULT_COLOR = "#121213";
const KEYBOARD_DEFAULT_COLOR = "#818384";
const BACKGROUND_CORRECT_COLOR = COLORBLIND_MODE ? "#E37E43" : "#618C55"; 
const BACKGROUND_FOUND_COLOR = COLORBLIND_MODE ? "#94C1F6" : "#B1A04C";
const BACKGROUND_WRONG_COLOR = "#3A3A3C";

// Text Colors
const TEXT_DEFAULT_COLOR = "#FFFFFF";
const TEXT_ALERT_COLOR = "#B05050";
const TEXT_WIN_COLOR = COLORBLIND_MODE ? "#94C1F6" : "#618C55";
const TEXT_LOSS_COLOR = "#B05050";

// Fonts
const GUESS_FONT = "700 36px HelveticaNeue";
const ALERT_FONT = "700 20px HelveticaNeue";


/**
 * Accepts a KeyboardEvent and returns
 * the letter that was pressed, or null
 * if a letter wasn't pressed.
 */
function getKeystrokeLetter(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return null;
  const key = e.key.toLowerCase();

  if (!/^[a-z]$/.exec(key)) return null;

  return key;
}

/**
 * Accepts a KeyboardEvent and returns true
 * if that KeyboardEvent was the user pressing
 * enter (or return), and false otherwise.
 */
function isEnterKeystroke(e) {
  return (
    !e.altKey &&
    !e.ctrlKey &&
    !e.metaKey &&
    (e.code === "Enter" || e.code === "Return")
  );
}

/**
 * Accepts a KeyboardEvent and returns true
 * if that KeyboardEvent was the user pressing
 * backspace (or delete), and false otherwise.
 */
function isBackspaceKeystroke(e) {
  return (
    !e.altKey &&
    !e.ctrlKey &&
    !e.metaKey &&
    (e.code === "Backspace" || e.code === "Delete")
  );
}

/**
 * Accepts a string, and returns if it is a valid English word.
 */
function isEnglishWord(str) {
  return _DICTIONARY.has(str) || _COMMON_WORDS.has(str);
}

/**
 * Returns a random common word from the English lexicon,
 * that is NUM_LETTERS long.
 * 
 * Throws an error if no such word exists.
 */
function getRandomWord() {
  const nLetterWords = [..._COMMON_WORDS].filter(
    (word) => word.length === NUM_LETTERS
  );

  if (nLetterWords.length === 0) {
    throw new Error(
      `The list of common words does not have any words that are ${NUM_LETTERS} long!`
    );
  }

  return nLetterWords[randomInteger(0, nLetterWords.length)];
}

/** Main Function */
function Wordle() {
  const gw = GWindow(GWINDOW_WIDTH, GWINDOW_HEIGHT);

  let solution = getRandomWord();
  let word_index = 0; // tracks which Wordle guess the player is on
  let words = ["", "", "", "", "", ""];
  let current_guess = "";
  let keyboard = GKeyboard(KEYBOARD_X, KEYBOARD_Y, GWINDOW_WIDTH, TEXT_DEFAULT_COLOR, KEYBOARD_DEFAULT_COLOR);
  let alert_text = "Hello World!";
  let alert_color = TEXT_DEFAULT_COLOR;
  let win_state = "";

  draw();

  keyboard.addEventListener("keyclick", keyclickAction);
  keyboard.addEventListener("enter", enterAction);
  keyboard.addEventListener("backspace", backspaceAction);
  gw.addEventListener("keydown", keydownAction);

  // redirects keyboard input
  function keydownAction(e) {
    if (isEnterKeystroke(e)) {
      enterAction(e);
    }
    else if (isBackspaceKeystroke(e)) {
      backspaceAction(e);
    }
    else {
      if (getKeystrokeLetter(e) === null) { // to account for pressing non-alphabet keys
        //do nothing
      }
      else {
        keyclickAction(getKeystrokeLetter(e), e);
      }
    }
  }

  // activates when alphabetical key is pressed
  function keyclickAction(letter, e) {
    if (win_state === "win" || win_state === "lose") {  // stop action after game ends
      return;
    }
    if (alert_color === TEXT_ALERT_COLOR) {
      alert_text = "";
      draw();
    }
    if (current_guess.length >= 5) {
      // do nothing
    } 
    else {
      current_guess += letter;
      draw();
    }
  }

  // activates when enter key is pressed
  function enterAction(e) {
    if (win_state === "win" || win_state === "lose") {  // stop action after game ends
      return;
    }
    if (current_guess.length !== 5) { // too short condition
      alert_text = "Too short!"
      alert_color = TEXT_ALERT_COLOR;
      draw();
    }
    else if (!isEnglishWord(current_guess)) { // not a word condition
      alert_text = current_guess.toUpperCase() + " isn't a word!";
      alert_color = TEXT_ALERT_COLOR;
      draw();
    }
    else if (isWin()) { // win condition
      words[word_index] = current_guess;
      word_index++;
      current_guess = "";
      alert_text = "You won!";
      alert_color = TEXT_WIN_COLOR;
      win_state = "win";
      draw();
    }
    else if (isLose()) { // lose condition
      words[word_index] = current_guess;
      word_index++;
      current_guess = "";
      alert_text = "You lost!";
      alert_color = TEXT_LOSS_COLOR;
      win_state = "lose";
      draw();
    }
    else {
      words[word_index] = current_guess;
      word_index++;
      current_guess = "";
      draw();
    }
  }

  // activates when backspace is pressed
  function backspaceAction(e) {
    if (win_state === "win" || win_state === "lose") {  // stop action after game ends
      return;
    }
    if (current_guess.length <= 0) {
      // do nothing
    } 
    else {
      current_guess = current_guess.slice(0, -1);
      draw();
    }
  }
  
  // draw the entire view
  function draw() {
    gw.removeAll();
    gw.add(keyboard);
    GuessGrid(words);
    drawCurrentGuess(current_guess, GUESS_MARGIN + word_index * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN));
    Alert(alert_text, alert_color);
  }

  // returns a single guess square
  function GuessSquare(c, x, y, color) {
    let square = GCompound();
    let rect = drawRect(x, y, GUESS_SQUARE_SIZE, GUESS_SQUARE_SIZE, color);
    rect.setColor(BORDER_COLOR);
    square.add(rect);
    let character = GLabel(c.toUpperCase());
    character.setFont(GUESS_FONT);
    character.setColor(TEXT_DEFAULT_COLOR);
    square.add(character, x + (GUESS_SQUARE_SIZE - character.getWidth()) / 2, 
    y + (GUESS_SQUARE_SIZE + character.getAscent()) / 2);
    return square;
  }

  // draws and updates the characters in the player's current guess
  function drawCurrentGuess(word, y) {
    if (word_index >= NUM_GUESSES) {
      return;
    }
    for (let i = 0; i < NUM_LETTERS; i++) {
      if (i >= word.length) { // accounting for if one or more characters in the word is missing
        gw.add(GuessSquare(" ", GUESS_MARGIN + i * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN), y, BACKGROUND_DEFAULT_COLOR));
      }
      else {
        gw.add(GuessSquare(word[i], GUESS_MARGIN + i * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN), y, BACKGROUND_DEFAULT_COLOR));
      }
    }
  }

  // draw a Wordle row
  function GuessRow(word, y) {
    for (let i = 0; i < NUM_LETTERS; i++) {
      if (i >= word.length) { // accounting for if one or more characters in the word is missing
        gw.add(GuessSquare(" ", GUESS_MARGIN + i * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN), y, BACKGROUND_DEFAULT_COLOR));
      }
      else {
        if (word[i].toUpperCase() === solution[i].toUpperCase()) { // create green square
          gw.add(GuessSquare(word[i], GUESS_MARGIN + i * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN), y, BACKGROUND_CORRECT_COLOR));
          keyboard.setKeyColor(word[i], BACKGROUND_CORRECT_COLOR);
        } 
        else if (solution.includes(word[i])) { // create yellow square
          gw.add(GuessSquare(word[i], GUESS_MARGIN + i * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN), y, BACKGROUND_FOUND_COLOR));
          if (keyboard.getKeyColor(word[i]) !== BACKGROUND_CORRECT_COLOR) {
            keyboard.setKeyColor(word[i], BACKGROUND_FOUND_COLOR);
          }
        }
        else { // create gray square
          gw.add(GuessSquare(word[i], GUESS_MARGIN + i * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN), y, BACKGROUND_WRONG_COLOR));
          keyboard.setKeyColor(word[i], BACKGROUND_WRONG_COLOR);
        }
      }
    }
  }

  // draw the entire grid
  function GuessGrid(words) {
    for (let i = 0; i < NUM_GUESSES; i++) {
      if (i >= words.length) { // accounting for if a word in the array is missing 
        GuessRow("", GUESS_MARGIN + i * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN));
      }
      else {
        GuessRow(words[i], GUESS_MARGIN + i * (GUESS_SQUARE_SIZE + 2 * GUESS_MARGIN));
      }
    }
  }

  // create an alert displayed above the keyboard 
  function Alert(message, color) {
    let alert = GLabel(message);
    alert.setFont(ALERT_FONT);
    alert.setColor(color);
    gw.add(alert, ALERT_X - alert.getWidth() / 2, ALERT_Y + alert.getAscent() / 2);
  }

  // returns boolean for if the player won the game
  function isWin() {
    return (current_guess === solution);
  }

  // returns boolean for if the player lost the game
  function isLose() {
    return (current_guess !== solution && word_index >= NUM_GUESSES - 1);
  }
}

// draw rectangle for guess squares
function drawRect(x, y, width, height, color) {
   let rect = GRect(x, y, width, height);
   rect.setFilled(true);
   rect.setFillColor(color);
   return rect;
}
