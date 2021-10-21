#!/usr/bin/env node

const [,, ...args] = process.argv

let bulksplash

bulksplash = require('./index')

bulksplash(args)