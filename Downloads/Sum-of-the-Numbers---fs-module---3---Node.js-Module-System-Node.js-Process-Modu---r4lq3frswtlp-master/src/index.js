const fs = require("fs");
const path = require("path");
const inputPath = path.join(__dirname, "input.txt");
const outputPath = path.join(__dirname, "output.txt");

const data = fs.readFileSync(inputPath, "utf-8");
const lines = data.split("\n");
let sum = 0;
for (let line of lines) {
  if (line.trim()) {
    const number = Number(line.split(" ")[1]);
    sum += number;
  }
}
fs.writeFileSync(outputPath, sum.toString());