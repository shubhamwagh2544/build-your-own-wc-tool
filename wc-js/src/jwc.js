#!/usr/bin/env node

import fs from 'node:fs';

// parse cli arguments
console.log(process.argv)
const args = process.argv.slice(2);
console.log(args)

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
        console.error(err.message)
    }
} else {
    stream = process.stdin;
}
