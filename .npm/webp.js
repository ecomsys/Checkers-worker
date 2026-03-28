import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Папка с тяжелыми картинками
const inputDir = path.resolve(__dirname, '../public/images/source'); 
// Куда сохранить легкие картинки
const outputWebp = path.resolve(__dirname, '../public/images/webp'); 

// создаём только папку webp
await fs.ensureDir(outputWebp);

const files = await glob(
  path.join(inputDir, "**/*.{jpg,jpeg,png,JPG,JPEG,PNG}").replace(/\\/g, "/")
);

if (!files.length) {
  console.log(chalk.red("Нет изображений в папке source"));
  process.exit();
}

// формируем список файлов, которые реально нужно обновить
const filesToUpdate = [];

for (const file of files) {
  const relative = path.relative(inputDir, file);
  const webpPath = path.join(outputWebp, relative).replace(path.extname(relative), ".webp");

  const webpExists = await fs.pathExists(webpPath);

  if (!webpExists) {
    filesToUpdate.push({ file, relative, webpPath, webpExists });
  }
}

if (!filesToUpdate.length) {
  console.log(chalk.yellow("Конвертировать нечего — все файлы уже в актуальном формате!"));
  process.exit();
}

console.log(chalk.cyan(`Нужно конвертировать ${filesToUpdate.length} файлов:\n`));

await Promise.all(
  filesToUpdate.map(async ({ file, relative, webpPath, webpExists }) => {
    await fs.ensureDir(path.dirname(webpPath));

    try {
      if (!webpExists) {
        await sharp(file)
          .webp({ quality: 82, effort: 6 })
          .toFile(webpPath);
        console.log(chalk.green("WEBP "), relative);
      }
    } catch (e) {
      console.log(chalk.red("Ошибка:"), relative, e.message);
    }
  })
);

console.log(chalk.cyan("\nГотово. Конвертация только в WEBP!"));