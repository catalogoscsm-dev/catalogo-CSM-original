const fs = require("fs");
const pdf = require("pdf-parse");

const buffer = fs.readFileSync("C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\ACQUARELLA - AGO 2023\\ACQUARELLA - AGO 2023.pdf");

pdf(buffer).then(data => {
  console.log("Páginas:", data.numpages);
  console.log("--- TEXTO ---");
  console.log(data.text.substring(0, 5000));
});
