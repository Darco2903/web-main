# web-server

## Description

### Darco2903' Web Server

Download page at /downloads
Server Manager at /server-manager

All main (index.html pages) pages use [**/js/endPath.js**](/server/js/endPath.js) to ensure that the path ends with a slash

All pages that use color themes use [**/js/theme.js**](/server/js/theme.js) to handle the theme. They also have to include [**/style.css**](/server/style.css) (will change) to apply the theme. The last thing those pages must have in order to work is a html body with a class "theme" with value "light" or "dark" and a hidden attribute like this:

```html
<body theme="light" hidden></body>
```

Server gets game servers console output from the game server and store them it /stream folder, achieved by [**/php/putStream.php**](/server/php/putStream.php)

They are then displayed on the console page [**/server-manager/console/**](/server/server-manager/console/index.html) with the help of SSE script [**/php/stream.php**](/server/php/stream.php)

## Installation

`/config/game-server.json`

```json
{
    "host": "game-server-ip",
    "port": 9999
}
```
