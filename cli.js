#!/usr/bin/env node
import {bulksplashh} from './index.js'
// let bulksplash = import('./index.js')

const [,, ...args] = process.argv


bulksplashh(args)