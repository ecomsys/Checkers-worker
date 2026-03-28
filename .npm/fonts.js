import fs from "fs-extra";
import path from "path";
import ttf2woff2 from "ttf2woff2";
import * as Font from "fonteditor-core"; // важное исправление!
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const fontsDir = path.join(rootDir, "public", "fonts");
const woffDir = path.join(fontsDir, "WOFF2");
const cssFile = path.join(rootDir, "src", "styles", "fonts.css");

const italicRegex = /italic/i;

const fontFaceTemplate = (name, file, weight, style) => `@font-face {
  font-family: "${name}";
  src: url("/fonts/WOFF2/${file}.woff2") format("woff2");
  font-display: swap;
  font-weight: ${weight};
  font-style: ${style};
}

`;

async function convertOtfToTtf(filePath) {
  const buffer = await fs.readFile(filePath);
  const font = Font.Font.create(buffer, { type: "otf", hinting: true }); // правильно
  const ttfBuffer = Buffer.from(font.write({ type: "ttf", hinting: true }));
  const ttfPath = filePath.replace(/\.otf$/i, ".ttf");
  await fs.writeFile(ttfPath, ttfBuffer);
  return ttfPath;
}

async function convertTtfToWoff2(ttfPath) {
  const buffer = await fs.readFile(ttfPath);
  const woff2Buffer = ttf2woff2(buffer);
  const fileName = path.basename(ttfPath, ".ttf");
  const woff2Path = path.join(woffDir, `${fileName}.woff2`);
  await fs.writeFile(woff2Path, woff2Buffer);
  await fs.remove(ttfPath); // удаляем временный TTF
  return fileName;
}

function parseFontFileName(fileName) {
  let name = fileName.split("-")[0].replace(/[_\s]+/g, "");
  let weight = 400;
  let style = italicRegex.test(fileName.toLowerCase()) ? "italic" : "normal";

  if (/-ultrablack/i.test(fileName)) weight = 950;
  else if (/-extrablack/i.test(fileName)) weight = 950;
  else if (/-black/i.test(fileName)) weight = 900;
  else if (/-heavy/i.test(fileName)) weight = 900;
  else if (/-bold/i.test(fileName)) weight = 700;
  else if (/-semibold/i.test(fileName)) weight = 600;
  else if (/-demibold/i.test(fileName)) weight = 600;
  else if (/-medium/i.test(fileName)) weight = 500;
  else if (/-regular/i.test(fileName)) weight = 400;
  else if (/-light/i.test(fileName)) weight = 300;
  else if (/-thin/i.test(fileName)) weight = 100;
  else if (/-hairline/i.test(fileName)) weight = 100;
  else if (/-extralight/i.test(fileName)) weight = 200;
  else if (/-ultralight/i.test(fileName)) weight = 200;

  return { name, weight, style };
}

async function run() {
  console.log("Обработка шрифтов...");

  await fs.ensureDir(woffDir);
  const files = (await fs.readdir(fontsDir)).filter(f => /\.(otf|ttf)$/i.test(f));
  await fs.writeFile(cssFile, "");

  const processedFonts = new Set();

  for (const file of files) {
    let filePath = path.join(fontsDir, file);

    if (/\.otf$/i.test(file)) {
      try {
        filePath = await convertOtfToTtf(filePath);
        console.log(`✔ ${file} → TTF`);
      } catch (err) {
        console.log(`Ошибка конвертации ${file}:`, err.message);
        continue;
      }
    }

    let fileName;
    try {
      fileName = await convertTtfToWoff2(filePath);
      console.log(`✔ ${file} → WOFF2`);
    } catch (err) {
      console.log(`Ошибка конвертации ${file} → WOFF2:`, err.message);
      continue;
    }

    if (processedFonts.has(fileName)) continue;

    const { name, weight, style } = parseFontFileName(fileName);
    await fs.appendFile(cssFile, fontFaceTemplate(name, fileName, weight, style));
    processedFonts.add(fileName);
  }

  console.log("fonts.css обновлён!");
  console.log("Готово!");
}

run();