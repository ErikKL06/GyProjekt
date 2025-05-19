// Spelplan
const blockSize = 30;
const rows = 15;
const cols = 15;
let board;
let context;

// Ormens huvud
let snakeX = blockSize * 5;
let snakeY = blockSize * 5;

// Bashastigheter
let velocityX = 0;
let velocityY = 0;

// Array för att spara positionen av ormen
let snakeBody = [];

// Matens positionsvariabler
let foodX;
let foodY;

// Boolean för att kolla om spelet är över
let gameOver = false;

// Laddar in bilder till huvudet
const snakeHead = new Image();
snakeHead.src = "img/head.png";

const foodImage = new Image();
foodImage.src = "img/IdasApple.png";

const snakeBodyImage = new Image();
snakeBodyImage.src = "img/Sbody.png";

// Laddar in basvärden för poäng och startar async funktion till api
fetchHighscore();
let gamescore = 0;

// Variabel för att kolla om du har ändrat position redan på samma ruta
let directionChanged = false;

// Lägger till en tabell för highscores
let table = document.getElementById("highscoreTable");

let score = document.getElementById("score");
score.innerHTML = "Score: " + gamescore;

// Variabel för att kolla vem som är inloggad
let userLoggedIn = "";

// Variabel för att vrida huvudet
let rotationVinkel = 0;

// Variabler för requestAnimationFrame timing
let lastTime = 0;
let frameInterval = 1000 / 6; // Samma som setInterval timing (6 FPS)
let accumulator = 0;

// Funktion som säger vad som händer när sidan laddas in
window.onload = () => {
  // Variabel till spelplanen
  board = document.getElementById("board");
  context = board.getContext("2d");
  getUsername();
  if (userLoggedIn != "Gäst") {
    getUserScores();
  }
  fetchAllHighscores();

  // Lägger in maten
  placeFood();

  // Händelselyssnare för att styra ormen
  document.addEventListener("keyup", changeDirection);

  // Starta animationsloopen med requestAnimationFrame
  requestAnimationFrame(gameLoop);
};

// Spelloop funktion som använder requestAnimationFrame
function gameLoop(timestamp) {
  // Beräkna tid mellan bildrutor
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Gör så att spelet inte går för snabbt eller för långsamt
  accumulator += deltaTime;

  // Uppdatera bara när tillräckligt med tid har passerat
  if (accumulator >= frameInterval) {
    // Uppdatera spelläget
    update();

    // Subtrahera frame-intervallet
    accumulator -= frameInterval;
  }

  // Fortsätt loopen
  requestAnimationFrame(gameLoop);
}

function update() {
  // Kollar och gameover och om det är sant så lämnar man funktionen
  if (gameOver) {
    return;
  }

  rensaBoard(); // Rensar spelplanen
  // Ritar ut maten
  context.drawImage(foodImage, foodX, foodY, blockSize, blockSize);

  renderGrid(); // Ritar ut rutnätet

  checkFood(); // Kollar om maten är uppäten

  flyttaOrm(); // Flyttar ormen

  updateraOrmPos(); // Uppdaterar ormens position

  ritaOrm(); // Ritar ut allt

  kollaGameOver(); // Kollar om spelet är över

  directionChanged = false; // Återställer riktningsändringsflaggan
}

function renderGrid() {
  const xMax = board.width; // Bredden på canvasen
  const yMax = board.height; // Höjden på canvasen
  const gridSize = 30; // Storlek på rutorna

  // Ritar ut rutnätet
  context.beginPath();
  context.strokeStyle = "#3A5A40"; // Rutnätets linjefärg

  // Vertikala rutnätslinjer
  for (let x = 0; x <= xMax; x += gridSize) {
    context.moveTo(x, 0); // Flyttar linjerna ända vägen upp till botten
    context.lineTo(x, yMax);
  }

  // Horisontella rutnätslinjer
  for (let y = 0; y <= yMax; y += gridSize) {
    context.moveTo(0, y); // Flyttar till starten av raden
    context.lineTo(xMax, y); // Ritar till slutet av raden
  }

  context.stroke(); // Rita ut allt
}

// Funktion för att ändra håll ormen åker åt
function changeDirection(e) {
  if (directionChanged) return; // Hindrar att kunna ändra håll på samma ruta

  if ((e.code == "ArrowUp" || e.code == "KeyW") && velocityY != 1) {
    velocityX = 0;
    velocityY = -1;
    rotationVinkel = 0;
    directionChanged = true;
  } else if ((e.code == "ArrowDown" || e.code == "KeyS") && velocityY != -1) {
    velocityX = 0;
    velocityY = 1;
    rotationVinkel = 180;
    directionChanged = true;
  } else if ((e.code == "ArrowLeft" || e.code == "KeyA") && velocityX != 1) {
    velocityX = -1;
    velocityY = 0;
    rotationVinkel = 270;
    directionChanged = true;
  } else if ((e.code == "ArrowRight" || e.code == "KeyD") && velocityX != -1) {
    velocityX = 1;
    velocityY = 0;
    rotationVinkel = 90;
    directionChanged = true;
  }
}

function rensaBoard() {
  // Rensar spelplanen
  context.fillStyle = "#588157";
  context.fillRect(0, 0, board.width, board.height);
}

function checkFood() {
  // Kollar om ormen ätit mat
  if (snakeX == foodX && snakeY == foodY) {
    // Lägger till en ruta på ormen om den har ätit
    snakeBody.push([foodX, foodY]);
    gamescore += 1;
    updateScore();
    // Placera ut ny mat
    placeFood();
  }
}

function updateScore() {
  score.innerHTML = "Score: " + gamescore;
}

function updateHighscore() {
  let highscoreHTML = document.getElementById("highscoreHTML");
  highscoreHTML.innerHTML = "Highscore: " + highscore;
}

function flyttaOrm() {
  // Flyttar orm-arrayen (alltså ormens kropp utifrån huvudet)
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  if (snakeBody.length) {
    snakeBody[0] = [snakeX, snakeY];
  }
}

function updateraOrmPos() {
  // Uppdaterar ormens position
  // Beräknar ny X-koordinat baserat på hastighet och rutstorlek
  snakeX += velocityX * blockSize;
  // Beräknar ny Y-koordinat baserat på hastighet och rutstorlek
  snakeY += velocityY * blockSize;
}

function ritaOrm() {
  // Ritar ormens huvud med rotation
  // Sparar nuvarande canvas-tillstånd för att inte påverka andra ritoperationer
  context.save();
  // Flyttar ritpunkten till mitten av ormens huvud för korrekt rotation
  context.translate(snakeX + blockSize / 2, snakeY + blockSize / 2);
  // Roterar ormens huvudbild baserat på riktningen
  context.rotate((rotationVinkel * Math.PI) / 180); // Roterar ormens huvudbild
  // Ritar huvudet centrerat kring rotationspunkten
  context.drawImage(
    snakeHead,
    -blockSize / 2,
    -blockSize / 2,
    blockSize,
    blockSize
  );
  // Återställer canvas-tillståndet till innan rotationen
  context.restore();

  // Ritar ut ormens kropp
  // Loopar genom varje kroppsdel i snakeBody-arrayen
  for (let i = 0; i < snakeBody.length; i++) {
    // Ritar kroppsdelens bild på rätt position
    context.drawImage(
      snakeBodyImage,
      snakeBody[i][0],
      snakeBody[i][1],
      blockSize,
      blockSize
    );
  }
}

function kollaGameOver() {
  // Kollar om det är gameover
  if (
    snakeX < 0 ||
    snakeX >= cols * blockSize ||
    snakeY < 0 ||
    snakeY >= rows * blockSize
  ) {
    gameOver = true;
    if (highscore < gamescore) {
      setHighscore(gamescore);
      highscore = gamescore;
      updateHighscore();
    }
    addScore(gamescore);
    // Säkerställer att poängen uppdateras innan spelet avslutas
    updateScore();
    alert("Game Over");
    restart();
  }

  for (let i = 0; i < snakeBody.length; i++) {
    if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
      gameOver = true;
      if (highscore < gamescore) {
        setHighscore(gamescore);
        highscore = gamescore;
        updateHighscore();
      }
      addScore(gamescore);
      alert("Game Over");
      restart();
    }
  }
}

// Funktion för att placera mat
function placeFood() {
  let validPosition = false;

  while (!validPosition) {
    // Genererar position för nytt äpple
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;

    // Kollar så att ormens kropp inte är på samma position
    validPosition = true;
    for (let i = 0; i < snakeBody.length; i++) {
      if (foodX === snakeBody[i][0] && foodY === snakeBody[i][1]) {
        validPosition = false;
        break;
      }
    }
  }
}

//
function restart() {
  snakeX = blockSize * 5;
  snakeY = blockSize * 5;
  velocityX = 0;
  velocityY = 0;
  snakeBody = [];
  gameOver = false;
  placeFood();
  gamescore = 0;
  updateScore();
  fetchAllHighscores();

  getUsername();
  if (userLoggedIn != "Gäst") {
    getUserScores();
  }
}

async function fetchHighscore() {
  try {
    const response = await fetch("/api/getHighscore.php");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    highscore = parseInt(result);
    updateHighscore();
    console.log("Highscore:", highscore);
  } catch (error) {
    console.error(error.message);
  }
}

async function setHighscore(highscore) {
  console.log("Sending highscore:", highscore);
  const response = await fetch("/api/setHighscore.php", {
    method: "POST",
    body: JSON.stringify({ highscore: highscore }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  console.log("Response status:", response.status);
  const data = await response.json();
  console.log("Response data:", data);
}

async function addScore(score) {
  console.log("Sending score:", score);
  const response = await fetch("/api/addScore.php", {
    method: "POST",
    body: JSON.stringify({ score: score }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  console.log("Response status:", response.status);
  const data = await response.json();
  console.log("Response data:", data);
}

async function getUserScores() {
  let TotScore = 0;
  let avgScore = document.getElementById("avgScore");
  console.log("fetching user scores");
  const response = await fetch("/api/getUserScoresAPI.php");
  const data = await response.json();
  data.forEach((score) => {
    TotScore += score.score;
  });
  avgScore.innerHTML = "Average: " + (TotScore / data.length).toFixed(2); // Avrundera till 2 decimaler
}

async function fetchAllHighscores() {
  try {
    const response = await fetch("/api/getAllHighscores.php");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    // Rensar tabellen
    // !LÖS DETTA SÅ ATT DET BLIR SMIDIGARE BORTAGNING AV TABELL RADERNA
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }

    // Lägger till alla highscores i tabellen med en forEach loop eftersom att det är en associativ array
    result.forEach((highscore, index) => {
      let row = table.insertRow(index + 1); // Lägger till en ny rad efter den andra
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      cell1.innerHTML = highscore.username;
      cell2.innerHTML = highscore.highscore;
      if (highscore.username === userLoggedIn) {
        // Stylar användarnamnet om det är samma som den inloggade användaren
        row.style.color = "#ed1c24";
        row.style.fontWeight = "bold";
      }
    });
  } catch (error) {
    console.error(error.message);
  }
}

async function getUsername() {
  let userStatus = document.getElementById("userStatus");
  try {
    const response = await fetch("/api/currentUserAPI.php");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log("userLoggedin: " + result);
    userLoggedIn = result;
    userStatus.innerHTML = userLoggedIn;
  } catch (error) {
    console.error(error.message);
  }
}
