//spelplan
let blockSize = 30;
let rows = 15;
let cols = 15;
let board;
let context;

//ormens huvud
let snakeX = blockSize * 5;
let snakeY = blockSize * 5;

// Bashastigheter
let velocityX = 0;
let velocityY = 0;

// Array för att spara positionen av ormen
let snakeBody = [];

//matens positionsvariabler
let foodX;
let foodY;

//boolean för att kolla om spelet är över
let gameOver = false;

// laddar in bilder till huvudet
let snakeHead = new Image();
snakeHead.src = "img/head.png";

let foodImage = new Image();
foodImage.src = "img/IdasApple.png";

let snakeBodyImage = new Image();
snakeBodyImage.src = "img/Sbody.png";

//laddar in basvärden för poäng och startar async funktion till api
fetchHighscore();
let gamescore = 0;

//variabel för att kolla om du har ändrat position redan på samma ruta
let directionChanged = false;

//lägger till en tabell för highscores
let table = document.getElementById("highscoreTable");

let score = document.getElementById("score");
score.innerHTML = "Score: " + gamescore;

//variabel för att kolla vem som är inloggad
let userLoggedIn = "";

//variabel för att vrida huvudet
let rotationVinkel = 0;

// Variabler för requestAnimationFrame timing
let lastTime = 0;
let frameInterval = 1000 / 6; // Samma som setInterval timing (6 FPS)
let accumulator = 0;

// funktion som säger vad som händer när sidan laddas in
window.onload = () => {
  // Variabel till spelplanen
  board = document.getElementById("board");
  context = board.getContext("2d");
  getUsername();
  if(userLoggedIn != "Gäst") {
    getUserScores();
  }
  fetchAllHighscores();

  //lägger in maten
  placeFood();

  // händelselyssnare för att styra ormen
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
  // kollar och gameover och om det är sant så lämnar man funktionen
  if (gameOver) {
    return;
  }

  rensaBoard(); //rensar spelplanen
  // ritar ut maten
  context.drawImage(foodImage, foodX, foodY, blockSize, blockSize);

  renderGrid(); //ritar ut rutnätet

  checkFood(); //kollar om maten är uppäten

  flyttaOrm(); //flyttar ormen

  updateraOrmPos(); //uppdaterar ormens position

  ritaOrm(); //ritar ut allt

  kollaGameOver(); //kollar om spelet är över

  directionChanged = false; // Återställer riktningsändringsflaggan
}

function renderGrid() {
  const xMax = board.width; // bredden på canvasen
  const yMax = board.height; // höjden på canvasen
  const gridSize = 30; // storlek på rutorna

  //ritar ut rutnätet
  context.beginPath();
  context.strokeStyle = "#3A5A40"; // Rutnätets linjefärg

  // Vertikala rutnätslinjer
  for (let x = 0; x <= xMax; x += gridSize) {
    context.moveTo(x, 0); // flyttar linjerna ända vägen upp till botten
    context.lineTo(x, yMax);
  }

  // Horisontella rutnätslinjer
  for (let y = 0; y <= yMax; y += gridSize) {
    context.moveTo(0, y); //flyttar till starten av raden
    context.lineTo(xMax, y); //ritar till slutet av raden
  }

  context.stroke(); //rita ut allt
}

// funktion för att ändra håll ormen åker åt
function changeDirection(e) {
  if (directionChanged) return; //hindrar att kunna ändra håll på samma ruta

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
  //rensar spelplanen
  context.fillStyle = "#588157";
  context.fillRect(0, 0, board.width, board.height);
}

function checkFood() {
  // kollar om ormen ätit mat
  if (snakeX == foodX && snakeY == foodY) {
    //lägger till en ruta på ormen om den har ätit
    snakeBody.push([foodX, foodY]);
    gamescore += 1;
    updateScore();
    //placera ut ny mat
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
  //flyttar orm-arrayen
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  if (snakeBody.length) {
    snakeBody[0] = [snakeX, snakeY];
  }
}

function updateraOrmPos() {
  // uppdaterar ormens position
  snakeX += velocityX * blockSize;
  snakeY += velocityY * blockSize;
}

function ritaOrm() {
  // ritar ormens huvud med rotation
  context.save();
  context.translate(snakeX + blockSize / 2, snakeY + blockSize / 2);
  context.rotate((rotationVinkel * Math.PI) / 180);
  context.drawImage(
    snakeHead,
    -blockSize / 2,
    -blockSize / 2,
    blockSize,
    blockSize
  );
  context.restore();

  // ritar ut ormens kropp
  for (let i = 0; i < snakeBody.length; i++) {
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
  // kollar om det är gameover
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

//funktion för att placera mat
function placeFood() {
  let validPosition = false;

  while (!validPosition) {
    // genererar position för nytt äpple
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;

    //kollar så att ormens kropp inte är på samma position
    validPosition = true;
    for (let i = 0; i < snakeBody.length; i++) {
      if (foodX === snakeBody[i][0] && foodY === snakeBody[i][1]) {
        validPosition = false;
        break;
      }
    }
  }
}

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
  if(userLoggedIn != "Gäst") {
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
async function getUserScores(){
  let TotScore = 0;
  let avgScore = document.getElementById("avgScore");
  console.log("fetching user scores");
  const response = await fetch("/api/getUserScoresAPI.php");
  const data = await response.json();
  data.forEach((score) => {
    TotScore += score.score;
  });
  avgScore.innerHTML ="AvgScore: " + (TotScore / data.length);
}

//!GÖR funktion som hämtar avgScore och skickar in i tabellen

async function fetchAllHighscores() {
  try {
    const response = await fetch("/api/getAllHighscores.php");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    //rensar tabellen
    //! LÖS DETTA SÅ ATT DET BLIR SMIDIGARE BORTAGNING AV TABELL RADERNA
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }

    //Lägger till alla highscores i tabellen med en forEach loop eftersom att det är en associativ array
    result.forEach((highscore, index) => {
      let row = table.insertRow(index + 1); //lägger till en ny rad efter den andra
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      cell1.innerHTML = highscore.username;
      cell2.innerHTML = highscore.highscore;
      if (highscore.username === userLoggedIn) {
        //stylar användarnamnet om det är samma som den inloggade användaren
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
    console.log("userLoggedin: "+result);
    userLoggedIn = result;
    userStatus.innerHTML = userLoggedIn;
  } catch (error) {
    console.error(error.message);
  }
}
