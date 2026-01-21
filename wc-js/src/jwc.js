#!/usr/bin/env node

import fs from 'fs';

// 1. Parse CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("Usage: ccwc [-c|-l|-w|-m] [file]");
    process.exit(1);
}

const option = args[0];
const filePath = args[1];

const validOptions = new Set(["-c", "-l", "-w", "-m"]);

if (!validOptions.has(option)) {
    console.error("Usage: ccwc [-c|-l|-w|-m] [file]");
    process.exit(1);
}

// 2. Resolve input stream
const stream = filePath ? fs.createReadStream(filePath) : process.stdin;

// 3. Stream processor
let byteCount = 0;
let lineCount = 0;
let wordCount = 0;
let charCount = 0;

let inWord = false;

// For correct UTF-8 decoding across chunks (needed for -m)
let decoder = null;
if (option === "-m") {
    decoder = new TextDecoder("utf-8");
}

// 4. Stream processing
stream.on("data", (chunk) => {
    // bytes (always correct at buffer level)
    byteCount += chunk.length;

    // lines
    if (option === "-l") {
        for (let i = 0; i < chunk.length; i++) {
            if (chunk[i] === 10) lineCount++; // 'ascii for \n is 10'
        }
        return;
    }

    // words
    if (option === "-w") {
        const text = chunk.toString("utf8");

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isWhitespace = /\s/.test(ch);

            if (isWhitespace) {
                inWord = false;
            } else {
                if (!inWord) {
                    wordCount++;
                    inWord = true;
                }
            }
        }
        return;
    }

    // characters (Unicode)
    if (option === "-m") {
        const text = decoder.decode(chunk, { stream: true });

        // Count characters in decoded text
        // for..of iterates over Unicode code points (better than text.length)
        for (const _ch of text) {
            charCount++;
        }

    }
});

stream.on("error", (err) => {
    console.error(err.message);
    process.exit(1);
});

stream.on("end", () => {
    // Flush decoder at end for -m
    if (option === "-m") {
        const remaining = decoder.decode(); // flush internal buffer
        for (const _ch of remaining) {
            charCount++;
        }
    }

    /*let result;
    switch (option) {
        case "-c":
            result = byteCount;
            break;
        case "-l":
            result = lineCount;
            break;
        case "-w":
            result = wordCount;
            break;
        case "-m":
            result = charCount;
            break;
        default:
            console.error("Invalid option. Use one of: -c, -l, -w, -m");
            process.exit(1);
    }*/

    const resultMap = {
        "-c": byteCount,
        "-l": lineCount,
        "-w": wordCount,
        "-m": charCount,
    };

    const result = resultMap[option];

    if (result === undefined) {
        console.error("Invalid option. Use one of: -c, -l, -w, -m");
        process.exit(1);
    }

    if (filePath) {
        console.log(`${result} ${filePath}`);
    } else {
        console.log(result);
    }
});


/*
We need TextDecoder because UTF-8 is variable-length and a multibyte character can span chunk boundaries.
chunk.toString() decodes each chunk independently and can introduce replacement characters (�) when the
chunk ends mid-codepoint, causing incorrect -m counts. A streaming decoder preserves leftover bytes
between chunks and ensures correct character counting.
 */
