import * as fs from "fs";
import * as path from "path";
import { readFile, utils } from "xlsx";

const usage = "usage: xls2csv filename";

const args = process.argv;
if (args.length !== 3) {
    console.error(usage);
    process.exit(1);
}
const filename = args[2];
const baseOutFilename = filename.replace(/\.[^/.]+$/, "");

const workbook = readFile(path.join(process.cwd(), filename));
for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = utils.sheet_to_csv(sheet).replace(/[,]{2,}/gm, "");
    const outFilename = workbook.SheetNames.length === 1
        ? baseOutFilename + ".csv"
        : baseOutFilename + "_" + sheetName + ".csv";
    fs.writeFile(path.join(process.cwd(), outFilename), csv, undefined, () => { /* do nothing */ });
}
