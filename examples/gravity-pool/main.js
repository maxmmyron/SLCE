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

/*for(var i = 0; i < 100; i++){
    game.add(new circleObject(
        game, Math.floor(Math.random() * 10) + 5,
        new Color().getRandomColor(),
        Math.random() * game.gameWidth,
        Math.random() * game.gameHeight,
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10) - 5,
        Math.floor(Math.random() * 10) - 5
    ));
}*/

let radius = 15;
for(var i = 0; i < 5; i++){ //number of rows
    let xOffset = -(radius * 2) + (i * radius) + (radius * 2);
    let yOffset = (radius * 2 * (i * 0.89));
    for(var j = i; j >= 0; j--){ //balls per row
        game.add(new circleObject(
            game,
            radius,
            new Color().getRandomColor(),
            (game.gameWidth / 2) - (xOffset) + (j * radius * 2),
            (game.gameHeight / 4) - (yOffset),
            10,
            0,0
        ));
    }
}

game.add(new circleObject(
    game,
    radius,
    new Color().getRandomColor(),
    game.gameWidth / 2,
    game.gameHeight - 250,
    10,
    0,
    -10
));

game.nBodySimulator = new nBody(0.1, 0.001, 0.15, game.gameObjects);

let simulatorUpdates = [
    game.nBodySimulator
];

start(game, ctx, simulatorUpdates); //start the gameLoop
