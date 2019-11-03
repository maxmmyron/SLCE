//imports
import Game from "./core/game.js";
import {start} from "./core/gameLoop.js";
import circleObject from "./Objects/Circle.js";
import Color from "./Math/Color.js";
import nBody from "./Physics/nBody.js";

//define a new canvas given a canvas in DOM
let canvas = document.getElementById('gameCanvas');

let ctx = canvas.getContext('2d'); //define a new drawing context on our canvas

let game = new Game(canvas); //create a new game

game.add(new circleObject(game, 5, new Color().getRandomColor(), 500, 500, 200, 0, 0));
game.add(new circleObject(game, 5, new Color().getRandomColor(), 1000, 250, 15, 0, 0));

game.nBodySimulator = new nBody(1, 0.001, 100, game.gameObjects);

let simulatorUpdates = [
    game.nBodySimulator.updatePositionVectors(),
    game.nBodySimulator.updateVelocityVectors(),
    game.nBodySimulator.updateAccelerationVectors()
];

game.start(ctx); //start the game.

start(game, ctx, simulatorUpdates); //start the gameLoop

