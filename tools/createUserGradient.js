const fs = require("fs");

const ITER = 500;
const START_ANGLE = 135;

let text = "";

for (let i = 0; i <= ITER; i++) {
    const percent = i / ITER;
    text += (percent * 100).toFixed(2) + "%";
    text += "{";
    const deg = (360 * percent + START_ANGLE).toFixed(1);
    text += `--user-gradient-anim: linear-gradient(${deg}deg, var(--user-gradient));`;
    text += "}\n";
}

// console.log(text);

fs.writeFileSync("user-gradient.css", text);
