#!/usr/bin/env node
const fs = require('fs')

const path = './config.js'

try {
    if (fs.existsSync(path)) {
        process.exit(0)
    }
    else {
        process.exit(1)
    }
} catch (err) {
    process.exit(1)
}
