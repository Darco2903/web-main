<?php

$streamPath = "../stream";

$jsonGameServer = file_get_contents("../config/game-server.json");
$gameServer = json_decode($jsonGameServer);

if ($_SERVER["REMOTE_ADDR"] !== $gameServer->host) {
    echo "no-permission";
    exit(1);
}

$server = $_GET["server"];
if (empty($server)) {
    echo "no-server";
    exit(1);
}

if ($_SERVER['REQUEST_METHOD'] === "PUT") {
    $myEntireBody = file_get_contents('php://input');
    // append to file
    file_put_contents("$streamPath/$server", $myEntireBody, FILE_APPEND);
    // $file = fopen("$streamPath/$server", "w");
    // fwrite($file, $myEntireBody);
    // fclose($file);
} elseif ($_SERVER['REQUEST_METHOD'] === "DELETE") {
    unlink("$streamPath/$server");
}

?>