<?php

/**
 * Anluter till databasen och returnerar ett PDO-objekt
 * @return PDO  Objektet som returneras
 */
function connectToDb()
{
  // Definierar konstanter med användarinformation.
  define('DB_USER', 'world');
  define('DB_PASSWORD', '12345');
  define('DB_HOST', 'mariadb'); // mariadb om docker annars localhost
  define('DB_NAME', 'gyprojekt');

  // Skapar en anslutning till MySql och databasen egytalk
  $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8';
  $db = new PDO($dsn, DB_USER, DB_PASSWORD);

  return $db;
}

function addUser($email, $user, $pwd)
{
  $db = connectToDb();
  /* Bygger upp sql frågan */
  $stmt = $db->prepare("INSERT INTO users(uid, username, email, password) VALUES(UUID(), :user, :fn, :pwd)"); /* inanför prepare är sql frågan */

  $stmt->bindValue(":user", $user);
  $stmt->bindValue(":fn", $email);
  $stmt->bindValue(":pwd", $pwd);

  if ($stmt->execute())
    return true;
  else
    return false;
}

function getHighscore($uid)
{
  $db = connectToDb();
  $stmt = $db->prepare("SELECT highscore FROM users WHERE uid = :uid");
  $stmt->bindValue(":uid", $uid);

  $stmt->execute();

  if ($stmt->rowCount() == 1) {
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result['highscore'];
  } else {
    return $result['highscore'] = 0;
  }
}

function setHighscore($score)
{ //bara score behövs uid kollas i api:n.
  $db = connectToDb();


  $sqlkod = "UPDATE users SET highscore = :highscore WHERE uid = :uid";
  $stmt = $db->prepare($sqlkod);
  $stmt->bindValue(':uid', $_SESSION['uid']);
  $stmt->bindValue(':highscore', $score, PDO::PARAM_INT);
  echo $score;
  $stmt->execute();

  if ($stmt->execute())
    return true;
  else
    return false;
}

function addScore($score)
{
  $db = connectToDb();
  $stmt = $db->prepare("INSERT INTO scores(uid, score) VALUES(:uid, :score)");
  $stmt->bindValue(":uid", $_SESSION['uid']);
  $stmt->bindValue(":score", $score, PDO::PARAM_INT);

  if ($stmt->execute())
    return true;
  else
    return false;
}
function getUserScores()
{
  $db = connectToDb();
  $stmt = $db->prepare("SELECT score FROM scores WHERE uid = :uid LIMIT 15");
  $stmt->bindValue(":uid", $_SESSION['uid']);

  $stmt->execute();

  if ($stmt->rowCount() >= 1) {
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
  } else {
    return $result = 0;
  }
}
function getAllHighscores()
{
  $db = connectToDb();

  $sqlkod = "SELECT username, highscore FROM users WHERE 1 ORDER BY highscore DESC LIMIT 5";
  $stmt = $db->prepare($sqlkod);
  $stmt->execute();

  $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

  if ($stmt->execute())
    return $result;
  else
    return false;
}

function auth($user, $pwd)
{
  $db = connectToDb();
  /* Bygger upp sql frågan */
  $stmt = $db->prepare("SELECT * FROM users WHERE username = :user");
  $stmt->bindValue(":user", $user);

  $stmt->execute();

  $result['success'] = false;

  /** Kontroll att resultat finns */
  if ($stmt->rowCount() == 1) {
    // Hämtar användaren, kan endast kunna vara 1 person
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    // Kontrollerar lösenordet, och allt ok.
    if (password_verify($pwd, $user['password'])) {
      $result['success'] = true;
      $result['uid'] = $user['uid'];
      $result['username'] = $user['username'];
      $result['email'] = $user['email'];
    }
  }

  return $result;
}
