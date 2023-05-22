<?php

$uri = $_SERVER["REQUEST_URI"];
$path = parse_url($uri, PHP_URL_PATH);
if (substr($path, -1) == '/') {
	$path .= 'index.html';
}

function err404() {
	header("HTTP/1.0 404 Not Found");
	exit();
}

if (!file_exists("server/$path")) {
	err404();
}

return false;

?>