import * as fs from "fs";

import { error } from "./log";
import getRepoInfo from "git-repo-info";
import md5File from "md5-file";

// tslint:disable-next-line:no-var-requires
const MD5 = require("md5.js");
// tslint:disable-next-line:no-var-requires
const pjson = require("../package.json");

export default function generateBuildInfo(jsFile: string,
                                          wasmFile: string,
                                          buildFile: string) {
    if (!fs.existsSync(jsFile)) {
        error("File " + jsFile + " does not exists, did you build it?");
        jsFile = "";
    }

    if (!fs.existsSync(wasmFile)) {
        error("File " + wasmFile + " does not exists, did you build it?");
        wasmFile = "";
    }

    const info = getRepoInfo();
    const jsHash = jsFile ? md5File.sync(jsFile) : "---";
    const wasmHash = wasmFile ? md5File.sync(wasmFile) : "---";
    const seed = Date.now();
    const md5Version = new MD5().update(pjson.version)
        .update(info.sha)
        .update(wasmHash)
        .update(jsHash)
        .update(seed + "")
        .digest("hex");

    const jsFileSize = jsFile ? fs.statSync(jsFile).size : 0;
    const wasmFileSize = wasmFile ? fs.statSync(wasmFile).size : 0;

    fs.writeFileSync(buildFile,
                     "// Autogenerated\n" +
                     "// -------------\n" +
                     "// gulpfile.js --> generateBuildInfo\n\n" +
                     "export const Build = {\n" +
                     "    version: \"" + pjson.version + " (" + md5Version + ")\",\n" +
                     "    jsVersion: \"" + info.sha + "\",\n" +
                     "    wasmJsSize:  " + jsFileSize + ",\n" +
                     "    wasmVersion: \"" + wasmHash + "\",\n" +
                     "    wasmSize: " + wasmFileSize + ",\n" +
                     "    buildSeed:  " + seed + ",\n" +
                     "};\n");
};
