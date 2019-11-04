//imports
import Game from "./src/core/game.js";
import {start} from "./src/core/gameLoop.js";
import Circle from "./src/Objects/Circle.js";
import ColorManager from "./src/Math/ColorManager.js";
import nBody from "./src/Physics/nBody.js";

//define a new canvas given a canvas in DOM
let canvas = document.getElementById('gameCanvas');

let ctx = canvas.getContext('2d'); //define a new drawing context on our canvas

let game = new Game(canvas); //create a new game

let colorManager = new ColorManager();

let radius = 15;
for(var i = 0; i < 5; i++){ //number of rows
    let xOffset = -(radius * 2) + (i * radius) + (radius * 2);
    let yOffset = (radius * 2 * (i * 0.89));
    for(var j = i; j >= 0; j--){ //balls per row
        game.add(new Circle(
            game,
            radius,
            colorManager.getRandomColor(),
            (game.gameWidth / 2) - (xOffset) + (j * radius * 2),
            (game.gameHeight / 4) - (yOffset),
            10,
            0,0,
            true
        ));
    }
}

game.add(new Circle(
    game,
    radius,
    colorManager.getRandomColor(),
    game.gameWidth / 2, game.gameHeight - 250,
    10,
    0, -10,
    false, true
));

game.nBodySimulator = new nBody(0.1, 0.001, 0.15, game.gameObjects);

let simulatorUpdates = [
    game.nBodySimulator
];

start(game, ctx, simulatorUpdates); //start the gameLoop

