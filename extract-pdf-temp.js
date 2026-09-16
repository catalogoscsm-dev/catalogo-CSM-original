const fs = require("fs");
const pdf = require("pdf-parse");
const buffer = fs.readFileSync(process.argv[2]);
pdf(buffer).then(data => {
  console.log("Páginas:", data.numpages);
  fs.writeFileSync("pdf-temp-texto.txt", data.text, "utf8");
  console.log("Caracteres:", data.text.length);
});
