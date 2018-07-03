import * as program from "commander";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";
import * as stream from "stream";
import * as wrap from "word-wrap";
import { readFile, Sheet, stream as xlsxStream } from "xlsx";

let usage = [
    "Converts Excel files (.xls, .xlsx) into CSV files by the same name. Outputs are placed in the current working",
    "directory and derive their name from the workbook and sheet names.",
    "\n\nFor example, given an Excel file of name 'foobar.xls' with sheets 'A' and 'B', the output files would be",
    "named 'foobar_A.csv' and 'foobar_B.csv'.",
].reduce((prev, curr) => prev + " " + curr);
usage = wrap(usage, { width: 80, indent: "", newline: "\n  " });

program
    .usage("[options] excel_file1 ...")
    .description(usage)
    .option("-s, --simple-output-name", "Do not append sheet name to output name for single-sheet workbooks.")
    .option("-t, --trim", "Trim empty cells from the end of each row.")
    .parse(process.argv);

if (program.args.length < 1) {
    // Must specify at least one input file.
    program.outputHelp();
    process.exit(1);
}

for (const filePath of program.args) {
    toCsv(filePath, { simpleOutputName: program.simpleOutputName, trimEmptyCells: program.trim });
}

export interface IOptions {
    simpleOutputName: boolean;
    trimEmptyCells: boolean;
}

export function toCsv(filePath: string, options: IOptions) {
    const baseOutFilename = path.basename(filePath).replace(/\.[^/.]+$/, "");
    const workbook = readFile(path.resolve(filePath));
    const promises: Array<Promise<void>> = [];
    for (const sheetName of workbook.SheetNames) {
        const outFilePath = path.resolve(
            process.cwd(),
            getOutFilename(baseOutFilename, sheetName, workbook.SheetNames, options),
        );
        const sheet = workbook.Sheets[sheetName];
        promises.push(streamToCsv(sheet, outFilePath, options));
    }
    return promises;
}

function streamToCsv(sheet: Sheet, outFilePath: string, options: IOptions) {
    return new Promise<void>((resolve, reject) => {
        const readStream = xlsxStream.to_csv(sheet) as Readable;
        const transformStream = new stream.Transform();
        transformStream._transform = (chunk, _encoding, _callback) => {
            if (options.trimEmptyCells) {
                transformStream.push(chunk.replace(/[,]{2,}$/gm, ""));
            } else {
                transformStream.push(chunk);
            }
        };
        const writeStream = fs.createWriteStream(outFilePath, { flags: "a+" });

        [readStream, transformStream, writeStream].forEach((someStream) => someStream.on("error", reject));
        writeStream.on("close", () => resolve());

        readStream.pipe(transformStream).pipe(writeStream);
    });
}

function getOutFilename(baseOutFilename: string, sheetName: string, sheetNames: string[], option: IOptions) {
    return sheetNames.length === 1 && option.simpleOutputName
        ? baseOutFilename + ".csv"
        : baseOutFilename + "_" + sheetName + ".csv";
}
