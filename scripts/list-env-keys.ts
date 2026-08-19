import fs from "fs";

const allEnvKeys = Object.keys(process.env);
fs.writeFileSync("all_env_keys.txt", allEnvKeys.join("\n"));
console.log("All env keys saved.");
