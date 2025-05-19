<?php
if (isset($_POST['email'], $_POST['userName'], $_POST['pwd'])) {
    include_once('../model/dbFunctions.php');
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_SPECIAL_CHARS);
    $user = filter_input(INPUT_POST, 'userName', FILTER_SANITIZE_SPECIAL_CHARS);
    $pwd = password_hash($_POST['pwd'], PASSWORD_DEFAULT);
    $result = addUser($email, $user, $pwd);


    //tar eventuella felmeddelanden
    if ($result = true) {
        header("Location: /login");
    } else {
        echo "<p>Kunde inte lägga till användaren. Kontrollera användarnamnet</p>";
    }
}
