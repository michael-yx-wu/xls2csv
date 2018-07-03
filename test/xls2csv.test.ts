import * as fs from "fs";
import * as path from "path";
import * as streamEqual from "stream-equal";
import { toCsv } from "../src/xls2csv";

test("convert xls to csv (no flags)", () => {
    return Promise.all(toCsv(path.resolve("./test/resources/input1.xls"), {
        simpleOutputName: false,
        trimEmptyCells: false,
    })).then(() => {
        const expectedOutput = fs.createReadStream("./test/resources/output1_Sheet1_no_flags.csv");
        const output = fs.createReadStream("./input1_Sheet1.csv");
        return streamEqual(expectedOutput, output);
    }).then((equal) => {
        expect(equal).toBe(true);
    });
});
