<?php

$path = $_GET["path"];
if (empty($path)) {
    echo "No path provided";
    http_response_code(500);
    exit(1);
}

exec("ls -1 ../$path", $output, $code);
if ($code != 0) {
    echo "Error listing files";
    http_response_code(500);
    exit(2);
}

foreach ($output as $line) {
    if (!empty($line)) {
        echo "$line";
    }
}

?>