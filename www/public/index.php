<?php

session_start();
?>
<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <script src="game3.js" defer></script>
   <link rel="stylesheet" href="style.css">
   <title>SnakeSpel</title>
</head>

<body>



   <section id="game-container">
      <canvas id="board" width="450rem" height="450rem">
         Din webbläsare stödjer inte HTML5 canvas tag.
      </canvas>
      <section id="highscore">
         <table id="highscoreTable">
            <tr>
               <th>USER</th>
               <th>HIGHSCORE</th>
            </tr>
         </table>
         <section id="scores">
            <p id="score">Score:</p>
            <p id="avgScore"></p>
            <h1 id="highscoreHTML">Highscore:</h1>
         </section>
      </section>
   </section>
   <section id="loginStatus">
      <p id="userStatus">Gäst</p>
      <?php
      if (isset($_SESSION['uid'])) {
         include 'private.php';
      } else {
         include 'public.php';
      }
      ?>
   </section>


</body>

</html>