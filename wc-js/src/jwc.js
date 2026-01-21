#!/usr/bin/env node

import fs from 'fs';

// parse cli arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("Usage: ccwc [-c|-l|-w] [file]");
    process.exit(1);
}

const option = args[0];
const filePath = args[1];

if (option !== "-c" && option !== "-l" && option !== "-w") {
    console.error("Usage: ccwc [-c|-l|-w] [file]");
    process.exit(1);
}

// resolve input stream
const stream = filePath ? fs.createReadStream(filePath) : process.stdin;

// process input stream
let byteCount = 0;
let lineCount = 0;
let wordCount = 0;

let inWord = false;

stream.on("data", (chunk) => {
    // bytes
    byteCount += chunk.length;

    // lines
    if (option === "-l") {
        for (let i = 0; i < chunk.length; i++) {
            if (chunk[i] === 10) lineCount++; // '\n'
        }
    }

    // words
    if (option === "-w") {
        // Convert chunk to string for whitespace detection.
        const text = chunk.toString();

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];

            // whitespace check (space, newline, tab, etc.)
            const isWhitespace = /\s/.test(ch);

            if (isWhitespace) {
                inWord = false; // OFF
            } else {
                if (!inWord) {  // set T only if F
                    wordCount++;
                    inWord = true;  // ON
                }
            }
        }
    }
});

stream.on("error", (err) => {
    console.error(err.message);
    process.exit(1);
});

stream.on("end", () => {
    let result;

    if (option === "-c") {
        result = byteCount;
    } else if (option === "-l") {
        result = lineCount;
    } else {
        result = wordCount;
    }

    if (filePath) {
        console.log(`${result} ${filePath}`);
    } else {
        console.log(result);
    }
});
