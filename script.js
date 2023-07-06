// Money Printing Sim
// Description: ICS3U Final Project, an incremental game similar to Cookie Clicker, but printing money instead of cookies. Ported from python p5js to pure p5js. Now its a personal project.
// Author: Lucas Leung
// Date: 16 June 2023

//-----------------------Setup-----------------------//
const bgColor = 235;
const windowWidth = 1280;
const windowHeight = 720;
let clickTextList = [];
let bankNoteList = [];
let achievementNotificationList = [];
let gameState = 0;
let printerMouseCollide = false;
let storedMillis = 0;
const autoSaveInterval = 10;
const blackColor = 0;
const aboutText = ["Lucas Leung", "June 16, 2023", "Mr. Marco Arsenault", "ICS3U", "Sem. 2"];
let gameTitleSize = (windowWidth + windowHeight) / 25;
let gameTitlePosX = windowWidth / 2;
let gameTitlePosY = windowHeight / 3.5;
let gameTitleColor = 0;
let moneyIncrease;
let aboutTextPosY = windowHeight / 2

// Title screen menu buttons
let selectedTitleScreenButton = 0;
let selectedGameplayButton;
let titleScreenButtonsLocked = false;
const titleScreenButtonMouseDist = 100;

// Size/fade values for menu button animations
let menuButtonFontSize = gameTitleSize / 2;
const minTitleScreenButtonWidth = windowWidth / 7.5;
const maxButtonWidth = minTitleScreenButtonWidth + minTitleScreenButtonWidth / 2.5;
let playButtonWidth = minTitleScreenButtonWidth;
let aboutButtonWidth = minTitleScreenButtonWidth;
let exitButtonWidth = minTitleScreenButtonWidth;
let playButtonAlpha = 255;
let aboutButtonAlpha = 255;
let exitButtonAlpha = 255;
const minTitleScreenButtonAlpha = 70;
const buttonWidthSpeed = 13;
const buttonAlphaSpeed = 20;

// Set height where printed bank note sprite is removed
const maxBankNoteHeight = 0;

// Values for displaying printer sprite
const printerMouseCollideDist = 100;
let printerWidth = windowWidth / 7.10;
let printerHeight = windowHeight / 4;
let printerPosX = windowWidth / 8;
let printerPosY = windowHeight / 1.2;
let printerAlpha = 255;

// Variables for mouse hover/click printer animation
const printerFadeAnimSpeed = 6;
const printerSizeAnimSpeed = 8;
const printerMaxFade = printerAlpha;
const printerMinFade = printerAlpha - (printerAlpha / 4);
const printerMaxWidth = printerWidth;
const printerMinWidth = printerWidth - (0.10 * printerWidth);
const printerMaxHeight = printerHeight;
const printerMinHeight = printerHeight - (0.10 * printerHeight);

// Text showing money earned which pops up from cursor when printer is clicked
const clickTextSpeed = 3;

// Main number during gameplay that shows total money
let moneyCounterSize = 75;
let moneyCounterPosX = windowWidth / 2;
let moneyCounterPosY = windowHeight / 5;
const moneyCounterColor = 0;

// Money/second (MpS) text shown during gameplay
let MpSSize = moneyCounterSize / 2.5;
let MpSPosX = moneyCounterPosX;
let MpSPosY = moneyCounterPosY + 60;
const MpSColor = 0;

// Upgrades/statistics buttons shown during gameplay
let statsButtonWidth = windowWidth / 7;
let upgradeButtonWidth = statsButtonWidth * 2;
let gameplayButtonFontSize = gameTitleSize / 3;
const gameplayButtonMouseDist = 80;
let upgradeButtonAlpha = 255;
let statsButtonAlpha = 255;
const minGameplayButtonAlpha = 70;

// Values for displaying achievement notification popup
const achievementFontSize = 24;
const achievementSpeed = 10;
const achievementDuration = 4000;

// Define assets
let moneyCounterFont;
let gameTitleFont;
let mediumFont;
let regularFont;
let gameLogo;
let currentPrinter;
let printer1;
let printer2;
let printer3;
let arrowKeys;
let cursor;
let moneyIcon;
let $5BankNote;
let $10BankNote;
let $20BankNote;
let $50BankNote;
let $100BankNote;
let statsIcon;
let ost;

function preload() {
  // Load sound
  ost = loadSound("assets/09. Max Coveri - Running in the 90's.flac");
  // Load fonts
  moneyCounterFont = loadFont('assets/BentonSansCond-Bold.ttf');
  gameTitleFont = loadFont('assets/MonomaniacOne-Regular.ttf');
  mediumFont = loadFont('assets/Geologica-Medium.ttf');
  regularFont = loadFont('assets/Geologica-Regular.ttf');
  // Load sprites
  gameLogo = loadImage('assets/gameLogo.png');
  arrowKeys = loadImage('assets/arrowKeys.png');
  cursor = loadImage('assets/cursor.png');
  moneyIcon = loadImage('assets/moneyStack.png');
  printer1 = loadImage('assets/printer.png');
  printer2 = loadImage('assets/printer2.png');
  printer3 = loadImage('assets/printer3.png');
  $5BankNote = loadImage('assets/$5.png');
  $10BankNote = loadImage('assets/$10.png');
  $20BankNote = loadImage('assets/$20.png');
  $50BankNote = loadImage('assets/$50.png');
  $100BankNote = loadImage('assets/$100.png');
  statsIcon = loadImage('assets/stats.webp');
}

// All unlockable achievements - format is num:name
const achievements = {
  "1": "Thanks for playing", // play the game at least once
  "2": "Avid reader", // open the about screen
  "3": "Humble beginnings", // print your first banknote
  "4": "Co-ordinated counterfeiting", // get $10/s
  "5": "Dedicated", // play for at least 1 hour
  "6": "60 second mark", // play for at least 60 seconds
  "7": "3 figures" // earn at least $100
};
const numAchievements = Object.keys(achievements).length;

// All buyable upgrades - format is name:description
const upgrades = {
  "Accurate sizing": "Banknotes are worth 3x more.",
  "Lighter paper": "Banknotes travel 2x faster.",
  "Color changing ink": "Squares your current MpP (money per print).",
  "$10 bill": "Banknotes are worth $10 more.",
  "$20 bill": "Banknotes are worth $20 more.",
  "$50 bill": "Banknotes are worth $50 more.",
  "$100 bill": "Banknotes are worth $100 more.",
  "Achievement bonus": "You gain more MpS (money per second) the more achievements you have.",
  "autoPrint.py": "Automatically print banknotes every 0.2s. You can still manually print."
};

// Load save state, i.e. saved gameplay data from localStorage
let money = 0;
let MpS = 1;
let moneyPerPrint = 1;
let printDelay = 0;
let bankNoteSpeed = 10;
let totalPrints = 0;
let unlockedAchievements = [];
let unlockedUpgrades = [];


//-----------------------Custom Functions-----------------------//
// Auto save game progress to localStorage at a set frequency
// WIP: Reddit post
//
//

//Determine when to unlock achievements and display them
function achievementFunction() {
  // move and display each notification popup box
  for (let i = 0; i < achievementNotificationList.length; i++) {
    achievementNotificationList[i].display();
    achievementNotificationList[i].move();
    // remove popup when it goes below the screen
    if (achievementNotificationList[i].remove()) {
      achievementNotificationList.splice(i, 1);
    }
  }

  // Condition to unlock achievement 7
  if (money >= 100 && !(unlockedAchievements.includes(achievements["7"]))) {
    achievementNotificationList.push(new achievementNotification(achievements["7"]));
    unlockedAchievements.push(achievements["7"]);
  }

  // Condition to unlock achievement 6
  if (millis() >= 60000 && !(unlockedAchievements.includes(achievements["6"]))) {
    achievementNotificationList.push(new achievementNotification(achievements["6"]));
    unlockedAchievements.push(achievements["6"]);
  }

  // Condition to unlock achievement 5
  if (millis() >= 3600000 && !(unlockedAchievements.includes(achievements["5"]))) {
    achievementNotificationList.push(new achievementNotification(achievements["5"]));
    unlockedAchievements.push(achievements["5"]);
  }
}

// Game title/text & logo displayed on title screen
function gameTitle() {
  strokeWeight(0);
  fill(gameTitleColor);
  textSize(gameTitleSize);
  textFont(gameTitleFont);
  text("Money Printing Sim", gameTitlePosX, gameTitlePosY);
  image(gameLogo, gameTitlePosX, gameTitlePosY - 90, gameTitleSize + 30, gameTitleSize + 30);
}

// Show arrow key/enter menu controls in bottom left corner
function titleScreenInstructions() {
  noFill();
  rect(gameTitlePosX / 7, gameTitlePosY * 3.2, arrowKeys.width / 3, arrowKeys.height / 7.5);
  image(arrowKeys, gameTitlePosX / 4.2, gameTitlePosY * 3.2, arrowKeys.width / 12, arrowKeys.height / 12);
  image(cursor, gameTitlePosX / 2.9, gameTitlePosY * 3.2, cursor.width / 11, cursor.height / 11);
  textSize(gameTitleSize / 3);
  textFont(mediumFont);
  fill(blackColor);
  text("Select", gameTitlePosX / 11, gameTitlePosY * 3.2);
}

function playButton() {
  fill(87, 255, 95, playButtonAlpha);
  rect(gameTitlePosX, gameTitlePosY * 1.9, playButtonWidth, windowHeight / 7.2);
  fill(blackColor);
  textSize(menuButtonFontSize);
  textFont(mediumFont);
  text("Play", gameTitlePosX, gameTitlePosY * 1.9);

  // Show size animation when play button selected
  if (selectedTitleScreenButton == 0) {
    if (playButtonWidth < maxButtonWidth) {
      playButtonWidth += buttonWidthSpeed;
    }
    // Shrink all other buttons
    if (aboutButtonWidth > minTitleScreenButtonWidth) {
      aboutButtonWidth -= buttonWidthSpeed;
    } else if (exitButtonWidth > minTitleScreenButtonWidth) {
      exitButtonWidth -= buttonWidthSpeed;
    }

    // Show fade animation when Play button selected, increase alpha of other buttons
    if (playButtonAlpha > minTitleScreenButtonAlpha) {
      playButtonAlpha -= buttonAlphaSpeed;
    }
    // Restore fade of all other buttons
    if (aboutButtonAlpha < 255) {
      aboutButtonAlpha += buttonAlphaSpeed;
    } else if (exitButtonAlpha < 255) {
      exitButtonAlpha += buttonAlphaSpeed;
    }
  }
}

function aboutButton() {
  fill(38, 78, 255, aboutButtonAlpha);
  rect(gameTitlePosX, gameTitlePosY * 2.5, aboutButtonWidth, windowHeight / 7.2);
  fill(blackColor);
  textSize(menuButtonFontSize);
  textFont(mediumFont);
  text("About", gameTitlePosX, gameTitlePosY * 2.5);

  // Show size animation when About button selected
  if (selectedTitleScreenButton == 1) {
    if (aboutButtonWidth < maxButtonWidth) {
      aboutButtonWidth += buttonWidthSpeed;
    }
    // shrink all other buttons
    if (playButtonWidth > minTitleScreenButtonWidth) {
      playButtonWidth -= buttonWidthSpeed;
    }
    if (exitButtonWidth > minTitleScreenButtonWidth) {
      exitButtonWidth -= buttonWidthSpeed;
    }

    // Show fade animation when About button selected, increase alpha of all other buttons
    if (aboutButtonAlpha > minTitleScreenButtonAlpha) {
      aboutButtonAlpha -= buttonAlphaSpeed;
    }
    if (playButtonAlpha < 255) {
      playButtonAlpha += buttonAlphaSpeed;
    } else if (exitButtonAlpha < 255) {
      exitButtonAlpha += buttonAlphaSpeed;
    }
  }
}

function exitButton() {
  fill(255, 30, 0, exitButtonAlpha);
  rect(gameTitlePosX, gameTitlePosY * 3.1, exitButtonWidth, windowHeight / 7.2);
  fill(blackColor);
  textSize(menuButtonFontSize);
  textFont(mediumFont);
  text("Exit", gameTitlePosX, gameTitlePosY * 3.1);

  // Size animation when Exit button selected
  if (selectedTitleScreenButton == 2) {
    if (exitButtonWidth < maxButtonWidth) {
      exitButtonWidth += buttonWidthSpeed;
    }
    // Shrink all other buttons
    if (playButtonWidth > minTitleScreenButtonWidth) {
      playButtonWidth -= buttonWidthSpeed;
    }
    if (aboutButtonWidth > minTitleScreenButtonWidth) {
      aboutButtonWidth -= buttonWidthSpeed;
    }

    // Show fade VFX when Exit button selected, increase alpha of all other buttons
    if (exitButtonAlpha > minTitleScreenButtonAlpha) {
      exitButtonAlpha -= buttonAlphaSpeed;
    }
    if (playButtonAlpha < 255) {
      playButtonAlpha += buttonAlphaSpeed;
    } else if (aboutButtonAlpha < 255) {
      aboutButtonAlpha += buttonAlphaSpeed;
    }
  }
}

// Detect mouse collision with Play button
function mouseTouchingPlayButton() {
  return dist(mouseX, mouseY, gameTitlePosX, gameTitlePosY * 1.9) < titleScreenButtonMouseDist;
}

// Detect mouse collision with About button
function mouseTouchingAboutButton() {
  return dist(mouseX, mouseY, gameTitlePosX, gameTitlePosY * 2.5) < titleScreenButtonMouseDist;
}

// Detect mouse collision with Exit button
function mouseTouchingExitButton() {
  return dist(mouseX, mouseY, gameTitlePosX, gameTitlePosY * 3.1) < titleScreenButtonMouseDist;
}

// Contains all the buttons on the title screen, functionality for selecting the buttons, and changing game state accordingly
function titleScreenButtons() {
  strokeWeight(3);
  playButton();
  aboutButton();
  exitButton();

  // Ensure menu selection with arrow keys won't skip to first or last button
  if (!keyIsPressed) {
    titleScreenButtonsLocked = false;
  }

  // Change menu button selection via arrow keys - only once each time up/down arrow is released
  if (!titleScreenButtonsLocked) {
    if (keyIsDown(UP_ARROW) && selectedTitleScreenButton != 0) {
      selectedTitleScreenButton -= 1;
      titleScreenButtonsLocked = true;
    } else if (keyIsDown(DOWN_ARROW) && selectedTitleScreenButton != 2) {
      selectedTitleScreenButton += 1;
      titleScreenButtonsLocked = true;
    }
  }

  // Hovering mouse over title screen buttons highlights them
  if (mouseTouchingPlayButton()) {
    selectedTitleScreenButton = 0;
  } else if (mouseTouchingAboutButton()) {
    selectedTitleScreenButton = 1;
  } else if (mouseTouchingExitButton()) {
    selectedTitleScreenButton = 2;
  }

  // When a button is highlighted, pressing Enter or left clicking it switches screens accordingly
  if ((keyIsPressed && keyCode == ENTER) || (mouseIsPressed && mouseButton == LEFT && mouseTouchingPlayButton()) || (mouseIsPressed && mouseButton == LEFT && mouseTouchingAboutButton()) || (mouseIsPressed && mouseButton == LEFT && mouseTouchingExitButton())) {
    if (selectedTitleScreenButton == 0) {
      gameState = 1;
    } else if (selectedTitleScreenButton == 1) {
      gameState = 2;
    } else if (selectedTitleScreenButton == 2) {
      gameState = 3;
    }
  }
}

// Perform money earning calculation and increment money
function moneyPerSecond() {
  if (storedMillis + 100 <= millis()) {
    moneyIncrease = MpS / 10;
    money += moneyIncrease;
    storedMillis = millis();
  }
  // Draw the money per second counter
  strokeWeight(0);
  fill(MpSColor);
  textSize(MpSSize);
  textFont(moneyCounterFont);
  text(`Money per second: ${MpS}`, MpSPosX, MpSPosY);
}

// In-game text displaying total amount of money earned
function moneyCounter() {
  fill(moneyCounterColor);
  textSize(moneyCounterSize);
  textFont(moneyCounterFont);
  text("$" + round(money, 5), moneyCounterPosX, moneyCounterPosY);
}

// Prints money sprite from printer which moves towards top of screen
function printBankNote() {
  bankNoteList.push(new bankNote());
  // Increment amount of prints to show on Stats screen
  totalPrints += 1;
}

// Printer sprite which prints banknotes out of it when left clicked or spacebar pressed
function printer() {
  currentPrinter = printer1;
  tint(255, printerAlpha);
  image(currentPrinter, printerPosX, printerPosY, printerWidth, printerHeight);

  //Return if mouse collides with printer
  if ((dist(mouseX, mouseY, printerPosX, printerPosY)) < printerMouseCollideDist) {
    printerMouseCollide = true;
  } else {
    printerMouseCollide = false;
  }

  // Fade animtion when hovering over printer with mouse
  if (printerMouseCollide && printerAlpha > printerMinFade) {
    printerAlpha -= printerFadeAnimSpeed;
  } else if (!printerMouseCollide && printerAlpha < printerMaxFade) {
    printerAlpha += printerFadeAnimSpeed;
  }

  // Animate size of printer when clicked or spacebar pressed
  if (((mouseIsPressed && mouseButton == LEFT && printerMouseCollide) || keyIsDown(32)) && (printerWidth >= printerMinWidth) && (printerHeight >= printerMinHeight)) {
    printerWidth -= printerSizeAnimSpeed;
    printerHeight -= printerSizeAnimSpeed;
  } else if ((!mouseIsPressed || !printerMouseCollide) && printerWidth <= printerMaxWidth && printerHeight <= printerMaxHeight) {
    printerWidth += printerSizeAnimSpeed;
    printerHeight += printerSizeAnimSpeed;
  }

  // Move/display each click text and remove when max height reached
  for (let i = 0; i < clickTextList.length; i++) {
    clickTextList[i].move();
    clickTextList[i].display();
    if (clickTextList[i].maxHeightReached()) {
      clickTextList.splice(i, 1);
    }
  }
  // Move and display each printed banknote
  for (let i = 0; i < bankNoteList.length; i++) {
    bankNoteList[i].move();
    bankNoteList[i].display();
    // remove bank note from array when target height reached and display popup text showing money earned
    if (bankNoteList[i].maxHeightReached()) {
      money += moneyPerPrint;
      bankNoteList.splice(i, 1);
      clickTextList.push(new clickText());
    }
  }
}

// In-game upgrade button, WIP
function upgradeButton() {
  fill(252, 140, 3, upgradeButtonAlpha);
  rect(windowWidth / 1.06, windowHeight / 2, upgradeButtonWidth, windowHeight / 7, 15);
  fill(blackColor);
  textSize(gameplayButtonFontSize);
  textFont(mediumFont);
  text("Upgrade [U]", windowWidth / 1.06, windowHeight / 2);
}

// Draw in-game Stats button
function statsButton() {
  fill(186, 3, 252, statsButtonAlpha);
  rect(windowWidth / 1.06, windowHeight / 1.5, statsButtonWidth, windowHeight / 7, 15);
  fill(blackColor);
  textSize(gameplayButtonFontSize);
  textFont(mediumFont);
  text("Stats [S]", windowWidth / 1.06, windowHeight / 1.5);
}

// Detect mouse collision with Upgrade button
function mouseTouchingUpgradeButton() {
  return (dist(mouseX, mouseY, windowWidth / 1.06, windowHeight / 2) < gameplayButtonMouseDist);
}

// Detect mouse collision with Stats button
function mouseTouchingStatsButton() {
  return (dist(mouseX, mouseY, windowWidth / 1.06, windowHeight / 1.5) < gameplayButtonMouseDist);
}

// Contains all buttons that appear in-game. Displays upgrade/stats buttons, animates them, change game states
function gameplayButtons() {
  strokeWeight(3);
  upgradeButton();
  statsButton();

  // Hovering mouse over in-game menu buttons and left clicking chooses them
  if (mouseTouchingUpgradeButton()) {
    selectedGameplayButton = "Upgrade";
  } else if (mouseTouchingStatsButton()) {
    selectedGameplayButton = "Stats";
    if (mouseIsPressed && mouseButton == LEFT) {
      gameState = 4;
    }
  }

  // Mouse hover fade animation for stats/upgrade, increases alpha of other buttons
  if (selectedGameplayButton == "Upgrade") {
    if (upgradeButtonAlpha > minGameplayButtonAlpha) {
      upgradeButtonAlpha -= buttonAlphaSpeed;
    }
    if (statsButtonAlpha < 255) {
      statsButtonAlpha += buttonAlphaSpeed;
    }
  } else if (selectedGameplayButton == "Stats") {
    if (statsButtonAlpha > minGameplayButtonAlpha) {
      statsButtonAlpha -= buttonAlphaSpeed;
    }
    if (upgradeButtonAlpha < 255) {
      upgradeButtonAlpha += buttonAlphaSpeed;
    }
  }

  // Keyboard shortcuts to open the Upgrade and Stats screens
  if (keyIsPressed && (key == "u" || key == "U")) {

  } else if (keyIsPressed && (key == "s" || key == "S")) {
    gameState = 4;
  }
}

//-----------------------Classes-----------------------//

// Text showing money earned that pops up from the cursor when bank note reaches the top
class clickText {
  constructor() {
    this.posX = random(mouseX - 12, mouseX + 12);
    this.posY = mouseY;
    this.color = "green";
    this.size = (windowWidth + windowHeight) / 111;
    this.speedY = clickTextSpeed;
  }

  display() {
    fill(this.color);
    textSize(this.size);
    textFont(moneyCounterFont);
    text(`+${moneyPerPrint}`, this.posX, this.posY);
  }

  move() {
    this.posY -= this.speedY;
  }

  maxHeightReached() {
    return (this.posY < windowHeight / 3);
  }
}


// Banknote sprite which fires up out of the printer when printer is left-clicked or space pressed
class bankNote {
  constructor() {
    this.posX = printerPosX;
    this.posY = printerPosY;
    this.width = printerWidth / 1.5;
    this.height = printerHeight;
    this.currentBankNote = $5BankNote;
  }

  display() {
    image(this.currentBankNote, this.posX, this.posY, this.width, this.height);
  }

  move() {
    this.posY -= bankNoteSpeed;
  }

  maxHeightReached() {
    return (this.posY < 0);
  }
}


// Popup which appears when achievements are earned by the player
class achievementNotification {
  constructor(name) {
    this.name = name;
    this.posX = windowWidth - (windowWidth / 8);
    this.posY = windowHeight + (windowHeight / 8);
    this.width = windowWidth / 4;
    this.height = windowHeight / 5;
    // Number of seconds popup will appear for
    this.timeLimit = millis() + achievementDuration;
  }

  // Draw the popup box and show name of the unlocked achievement
  display() {
    strokeWeight(3);
    fill(176, 191, 207);
    rect(this.posX, this.posY, this.width, this.height);
    fill(blackColor);
    strokeWeight(0);
    textSize(achievementFontSize);
    textFont(mediumFont);
    text("Achievement Unlocked!", this.posX, this.posY - 40);
    textFont(regularFont);
    text(this.name, this.posX, this.posY);
  }

  // Remove achievement box from array when it's hidden from view
  remove() {
    return (this.posY > windowHeight * 2);
  }

  // Move achievement popup up on screen and move back down after specified time limit
  move() {
    if (millis() < this.timeLimit && this.posY > windowHeight / 1.08) {
      this.posY -= achievementSpeed;
    } else if (millis() > this.timeLimit) {
      this.posY += achievementSpeed;
    }
  }
}

//-----------------------Game States-----------------------//

// Title screen with Play, About, and Exit buttons, num of achievements, and menu navigation help
function titleScreen() {
  gameTitle();
  titleScreenButtons();
  titleScreenInstructions();
  // show copyright & num of unlocked achievements
  textSize(gameTitleSize / 4);
  text("©Lucas Leung 2023", windowWidth - 100, windowHeight - 20);
  textSize(gameTitleSize / 3);
  text("Achievements unlocked: " + unlockedAchievements.length + " out of " + numAchievements, windowWidth - 1050, windowHeight - 200);

  // Clear all printer click tex to ensure they don't remain when game is replayed
  for (let i = 0; i < clickTextList.length; i++) {
    clickTextList.splice(i, 1);
  }
}

// Main gameplay screen that starts when Play button is selected from title screen
function gameScreen() {
  moneyPerSecond();
  moneyCounter();
  printer();
  gameplayButtons();
  // autoSave();

  // Pressing Esc returns to title screen
  if (keyIsPressed && keyCode == 27) {
    gameState = 0;
  }
}

// Screen that shows extra info about the game when About button selected from the title screen
function aboutScreen() {
  strokeWeight(0);
  aboutTextPosY = windowHeight / 2;
  textSize(32);
  textFont(regularFont);
  text("Money Printing Sim is my first ever attempt at creating a somewhat polished game. As I've always been drawn to games that involve calculations, data, stats, etc., I was inspired by incremental games the likes of Cookie Clicker and Clicker Heroes.", 650, 150, windowWidth, windowHeight);
  for (let i = 0; i < aboutText.length; i++) {
    text(aboutText[i], 650, aboutTextPosY, windowWidth - 50, windowHeight - 50);
    aboutTextPosY += 50;
  }
  textSize(24);
  text("Press Esc to return to title screen", 650, aboutTextPosY + 50);


  // Pressing Esc key returns to title screen
  if (keyIsPressed && keyCode == 27) {
    gameState = 0;
  }
}

// menu displaying gameplay statistics, appearing when Stats button is selected
function statsScreen() {
  textSize(32);
  textFont(regularFont);
  image(statsIcon, windowWidth/2, 100, 150, 150);
  text("Playtime (minutes): " + round(millis()/60000, 1), windowWidth/2, 250, windowWidth, windowHeight);
  text(`Money per print: $${moneyPerPrint}`, windowWidth/2, 300, windowWidth, windowHeight);
  text(`Total prints: ${totalPrints}`, windowWidth/2, 350, windowWidth, windowHeight);
  text(`Banknote speed: ${bankNoteSpeed}`, 650, 400, windowWidth, windowHeight);
  textSize(24);
  text("Press r to return to game", 650, 700);

    // Pressing r key returns to gameplay screen
    if (keyIsPressed && keyCode == 82) {
      gameState = 1;
    }
}

//-----------------------Setup Function-----------------------//
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(bgColor);
  imageMode(CENTER);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  stroke(255);
}

//-----------------------Main Sketch-----------------------//
function draw() {
  print(ost, millis());
  background(bgColor);
  achievementFunction();

  // Change game screen according to whatever menu option is chosen by player (play, about, exit, stats)
  if (gameState == 0) {
    titleScreen();
    //condition to unlock achievement 1
    if (!(unlockedAchievements.includes(achievements["1"]))) {
      achievementNotificationList.push(new achievementNotification(achievements["1"]));
      unlockedAchievements.push(achievements["1"]);
    }
  } else if (gameState == 1) {
    gameScreen();
  } else if (gameState == 2) {
    aboutScreen();
    //condition to unlock achievement 2
    if (!(unlockedAchievements.includes(achievements["2"]))) {
      achievementNotificationList.push(new achievementNotification(achievements["2"]));
      unlockedAchievements.push(achievements["2"]);
    }

  } else if (gameState == 3) {
    remove();
  } else if (gameState == 4) {
    statsScreen();
  }
}

// Print banknote when printer is left clicked
function mouseClicked() {
  if (printerMouseCollide) {
    printBankNote();
    ost.play();
  }
}

// Print banknote when spacebar pressed ingame
function keyReleased() {
  if (gameState == 1 && keyCode == 32) {
    printBankNote();
  }
}