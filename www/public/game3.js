//board
let blockSize = 30;
let rows = 15;
let cols = 15;
let board;
let context;

//snake huvude
let snakeX = blockSize * 5;
let snakeY = blockSize * 5;

// Bas hastigheter
let velocityX = 0;
let velocityY = 0;

// Array för att spara position av ormen
let snakeBody = [];

//matens positionsvariabler
let foodX;
let foodY;

//boolean till att kolla om spelet är över
let gameOver = false;

// laddar in bilder till huvdet
let snakeHead = new Image();
snakeHead.src = "img/head.png";

let foodImage = new Image();
foodImage.src = "img/IdasApple.png";

let snakeBodyImage = new Image();
snakeBodyImage.src = "img/Sbody.png";

//laddar in basvärden för scores och startar async funktion till api
fetchHighscore();
let gamescore = 0;

//variable för att kolla om du har ändrat position redan på samma ruta
let directionChanged = false;

//lägger till en tabell för highscoresen
let table = document.getElementById("highscoreTable");

let score = document.getElementById("score");
score.innerHTML = "Score: " + gamescore;

//variabel för att kolla vem som är inloggad
let userLoggedIn = "";

//variabel till att vrida huvudet
let rotationVinkel = 0;

// funmktion som säger vad som händer när sidan laddas in
window.onload = function () { //! gör om till arrow och lägg in const till board och context och instansera i funktionen
  //variabel till boarden
  board = document.getElementById("board");
  context = board.getContext("2d");
  getUsername();
  fetchAllHighscores();

  //lägger in maten
  placeFood();

  // eventlistner till att starta
  document.addEventListener("keyup", changeDirection);

  // updateringsfrekvensen till funktionen update //! kör requestanimationframe istället
  setInterval(update, 1000 / 6);
};

function update() {
  // kollar och gameover och om det är sant så lämnar man funktionen
  if (gameOver) {
    return;
  }

  clearboard(); //clearar boarden
  // ritar ut maten
  context.drawImage(foodImage, foodX, foodY, blockSize, blockSize);

  renderGrid(); //ritar ut rutnätet

  checkFood(); //kollar om maten är uppäten

  moveSnake(); //flyttar ormen

  updateSnake(); //uppdaterar ormen

  drawSnake(); //ritar ut allt

  checkGameOver(); //kollar om spelet är över

  directionChanged = false; // Reset the direction change flag
}
function renderGrid() {
  const xMax = board.width; // bredden på canvasen
  const yMax = board.height; // höjden på canvasen
  const gridSize = 30; // storlek på rutorna

  //ritar ut griden
  context.beginPath();
  context.strokeStyle = "#3A5A40"; // Grid linje färg

  // Vertikala grid liner
  for (let x = 0; x <= xMax; x += gridSize) {
    context.moveTo(x, 0); // flyttar linjerna ända vägen upp till botten
    context.lineTo(x, yMax);
  }

  // Horisontala grid liner
  for (let y = 0; y <= yMax; y += gridSize) {
    context.moveTo(0, y); //flyttar till starten av raden
    context.lineTo(xMax, y); //ritar till slutet av raden
  }

  context.stroke(); //rita ut allt
}

// funktion till att ändra håll ormen åker åt
function changeDirection(e) {
  if (directionChanged) return; //hindrar att kunnat ändra håll på samma ruta

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

function clearboard() {
  //clearar boarden
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

function moveSnake() {
  //flyttar orm arrayen
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  if (snakeBody.length) {
    snakeBody[0] = [snakeX, snakeY];
  }
}

function updateSnake() {
  // updaterar ormenspostition
  snakeX += velocityX * blockSize;
  snakeY += velocityY * blockSize;
}

function drawSnake() {
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

  // ritar ut modelen
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

function checkGameOver() {
  // kollar om det är gameover
  if (snakeX < 0 ||snakeX >= cols * blockSize ||snakeY < 0 ||snakeY >= rows * blockSize
  ) {
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

//funktion till att placera mat
function placeFood() {
  let validPosition = false;

  while (!validPosition) {
    // genererar postition för nytt äpple
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

//!GÖR function som hämta avgScore och skicka in i tabellen

async function fetchAllHighscores() {
  try {
    const response = await fetch("/api/getAllHighscores.php");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    //clearar på tabellen
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
        //stylar usernamet om det är samma som den inloggade användaren
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
    console.log(result);
    userLoggedIn = result;
    userStatus.innerHTML = userLoggedIn;

  } catch (error) {
    console.error(error.message);
  }
}
