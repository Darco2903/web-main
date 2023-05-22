<?php

header('Content-Type: text/event-stream');
// header('Cache-Control: no-cache');
// header('Connection: keep-alive');
// header('X-Accel-Buffering: no');

$jsonGameServer = file_get_contents("../config/game-server.json");
$gameServer = json_decode($jsonGameServer);

$hostname = $gameServer->host;
$port = $gameServer->port;
$host = "http://$hostname:$port";

$jsonServers = file_get_contents("$host/servers.json");
if (empty($jsonServers)) {
    echo "event: error\n";
    echo "data: " . "game-server-not-online" . "\n\n";
    exit(1);
}
$servers = json_decode($jsonServers);

/**
 * @param int $port
 * @return bool
 */
function isOpen(int $port) {
    $cmd = "nmap -Pn -p $port " . $GLOBALS["hostname"];
    exec($cmd, $output, $code);
    if ($code == 0) {
        foreach ($output as $line) {
            if (str_contains($line, $port)) {
                return str_contains($line, "open");
            }
        }
    }
    return 0;
}

/**
 * @param bool $open
 */
function sendOpen(bool $open) {
    echo "event: open\n";
    echo "data: $open\n\n";
}

/**
 * @param string $name
 * @return bool
 */
function isRunning(string $name) {
    $url = $GLOBALS["host"] . "/?server=$name&command=status";
    $status = file_get_contents($url) == "running";
    return $status;
}

function sendNotRunning() {
    echo "event: error\n";
    echo "data: not-running\n\n";
    exit(4);
}

/**
 * @param string $name
 * @return string
 */
function getStream($name) {
    $url = $GLOBALS["host"] . "?server=$name&stream";
    $stream = file_get_contents($url);
    return $stream;
}

$query = $_GET["query"];

if (empty($query)) {
    echo "event: error\n";
    echo "data: no-query\n\n";
    exit(2);
}

$server = $servers->$query;
if (empty($server)) {
    echo "event: error\n";
    echo "data: undefined-stream\n\n";
    exit(3);
}

if (!isRunning($server->name)) {
    sendNotRunning();
}

$file = "../stream/$server->name";
if (!file_exists($file)) {
    echo "event: error\n";
    echo "data: stream-not-found\n\n";
    exit(5);
}

$restore = $_GET["restore"] == "true";
$lastpos = $restore ? 0 : filesize($file);
$i = 0;

session_start();

while (true) {

    usleep(300000); //0.3 s
    clearstatcache(false, $file);
    $len = filesize($file);
    if ($len < $lastpos) {
        //file deleted or reset
        $lastpos = $len;
    } elseif ($len > $lastpos) {
        $f = fopen($file, "rb");
        if ($f === false)
            die();
        fseek($f, $lastpos);
        while (!feof($f)) {
            $buffer = fread($f, 4096);
            // echo "data: " . $buffer . "\n\n";
            echo "data: " . str_replace("\n", "<br>", $buffer) . "\n\n";
        }
        $lastpos = ftell($f);
        fclose($f);
    }

    echo "\n";
    flush();
    if (ob_get_length() > 0) {
        ob_end_flush();
    }

    if ($i++ > 30) {
        $i = 0;
        if (!isRunning($server->name)) {
            sendNotRunning();
        }
        set_time_limit(10);
    }

    if (connection_aborted())
        break;
}


?>