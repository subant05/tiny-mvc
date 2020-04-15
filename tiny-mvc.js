import "babel-polyfill" 
import {router,RouterController} from './src/router'
const global = global || window
global.tinyMVC = {router,RouterController}