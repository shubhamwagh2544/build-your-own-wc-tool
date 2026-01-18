#!/usr/bin/env node

import fs from 'node:fs';

// parse cli arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] !== '-c') {
    console.error("Usage: ./jwc.js -c [file]")
    process.exit(1)
}

// input stream
let stream;
let filePath = args[1];
if (filePath) {
    try {
        stream = fs.createReadStream(filePath)
    } catch (err) {
        console.error('Unexpected Error: ', err.message)
    }
} else {
    stream = process.stdin;
}

// process stream
let byteCount = 0;
stream.on('data', (chunk) => {
    // console.log(chunk)  // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64 21 0a>
    byteCount += chunk.length
})
stream.on('error', (err) => {
    console.error('Unexpected Error: ', err.message)
    process.exit(1)
})
stream.on('end', () => {
    if (filePath) {
        console.log(`${byteCount} ${filePath}`)
    } else {
        console.log(byteCount)
    }
})
