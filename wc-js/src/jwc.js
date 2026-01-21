#!/usr/bin/env node

import fs from 'node:fs';

// parse cli arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("Usage: wc [-c|-l] [file]");
    process.exit(1);
}

const option = args[0];
const filePath = args[1];

if (option !== "-c" && option !== "-l") {
    console.error("Usage: ccwc [-c|-l] [file]");
    process.exit(1);
}

// input stream
let stream = filePath ? fs.createReadStream(filePath) : process.stdin;

// process stream
let byteCount = 0;
let lineCount = 0;

stream.on('data', (chunk) => {
    console.log(chunk)  // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64 21 0a>
    byteCount += chunk.length;
    if (option === '-l') {
        for (let i = 0; i < chunk.length; i++) {
            if (chunk[i] === 10) {  // 10 is ASCII for '\n'
                lineCount++;
            }
        }
    }

})
stream.on('error', (err) => {
    console.error('Unexpected Error: ', err.message)
    process.exit(1)
})

stream.on("end", () => {
    let result;

    if (option === "-c") {
        result = byteCount;
    } else {
        result = lineCount;
    }

    if (filePath) {
        console.log(`${result} ${filePath}`);
    }
    else {
        console.log(result);
    }
});
