const fs = require("fs");

const data = JSON.parse(fs.readFileSync("characters.json", "utf8"));

let totalSkills = 0;
let missingJP = 0;

for (const c of data) {

  const skills = ["skill1", "skill2", "burst"];

  for (const key of skills) {
    const s = c[key];
    if (!s) continue;

    totalSkills++;

    if (!s.jp || !s.name) {
      console.log(`❌ Missing JP: id=${c.id} skill=${key}`);
      missingJP++;
    }
  }
}

console.log("---- RESULT ----");
console.log("Total skills:", totalSkills);
console.log("Missing JP:", missingJP);