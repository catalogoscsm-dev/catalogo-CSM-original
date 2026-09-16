const fs = require("fs");
const pdf = require("pdf-parse");

const buffer = fs.readFileSync("C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\ACQUARELLA - AGO 2023\\ACQUARELLA - AGO 2023.pdf");

pdf(buffer).then(data => {
  fs.writeFileSync("acquarella-texto-completo.txt", data.text, "utf8");
  console.log("Salvo! Páginas:", data.numpages, "| Caracteres:", data.text.length);
});
