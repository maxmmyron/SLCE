/**
 * The main source code.
 * This implements the basic structure of the page, and mostly serves to size the canvas to a proper size, 
 * implement some obligatory DPI fixes, and initalizing the game to run. The world settings are also defined
 * here, which should probably be moved one day into it's own World class. :/
 */

import Game from "./core/game.js";
import {start} from "./core/gameLoop.js";

//define a new canvas variable from which the game is crafted upon
let canvas = document.getElementById('gameCanvas');

let ctx = canvas.getContext('2d');

//create a new game given the world constrains and variables.

let game = new Game(document.getElementById('gameCanvas'));
game.start(ctx); //start the game.

start(game, ctx);

