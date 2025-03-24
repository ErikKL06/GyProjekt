<?php
include("../../model/dbFunctions.php");

session_start();
header("Access-Control-Allow-Origin: *");
$input = json_decode(file_get_contents("php://input"), true);
echo json_encode($input);



if ((isset($_SESSION['uid']))) {
    $score = (int)$input['score'];

    addScore($score);

    echo json_encode(['status' => 'success', 'score' => $score]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input or session']);
}
