//imports
import Game from "../../src/core/game.js";
import {start} from "../../src/core/gameLoop.js";
import circleObject from "../../src/Objects/Circle.js";
import Color from "../../src/Math/Color.js";
import nBody from "../../src/Physics/nBody.js";

//define a new canvas given a canvas in DOM
let canvas = document.getElementById('gameCanvas');

let ctx = canvas.getContext('2d'); //define a new drawing context on our canvas

let game = new Game(canvas); //create a new game

for(var i = 0; i < 100; i++){
    game.add(new circleObject(
        game, Math.floor(Math.random() * 10) + 5,
        new Color().getRandomColor(),
        Math.random() * game.gameWidth,
        Math.random() * game.gameHeight,
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10) - 5,
        Math.floor(Math.random() * 10) - 5
    ));
}

game.nBodySimulator = new nBody(0.25, 0.001, 0.15, game.gameObjects);

let simulatorUpdates = [
    {
        'method': game.nBodySimulator,
        'args' : []
    }
];

start(game, ctx, simulatorUpdates); //start the gameLoop

