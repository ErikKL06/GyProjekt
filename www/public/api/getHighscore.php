<?php
include("../../model/dbFunctions.php");

session_start();


// Kolla session med uid
if (isset($_SESSION['uid'])) {
    $result = (int)getHighscore($_SESSION['uid']);
    //$result = (int)getHighscore('33f6649e-d72a-11ef-ba2d-0242ac141002');
} else {
    $result = 0;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
echo json_encode($result);
