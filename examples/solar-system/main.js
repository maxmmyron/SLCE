//imports
import Game from "../../src/core/game.js";
import {start} from "../../src/core/gameLoop.js";
import Circle from "../../src/Objects/Circle.js";
import ColorManager from "../../src/Math/ColorManager.js";
import nBody from "../../src/Physics/nBody.js";
import Polygon from "../../src/Objects/Polygon.js";
import Vector from "../../src/Math/Vector.js";

//define a new canvas given a canvas in DOM
let canvas = document.getElementById('gameCanvas');

let ctx = canvas.getContext('2d'); //define a new drawing context on our canvas

let game = new Game(canvas, "#000000"); //create a new game

let colorManager = new ColorManager();

let radius = 15;
game.add(new Circle(
    game,
    radius / 2.1, 
    game.UUM.universalColorManager.getRandomColor(),
    new Vector(game.gameWidth / 2 + 300, game.gameHeight / 2),
    0.0099,
    new Vector(0, -20),
    false, false
));

game.add(new Circle(
    game,
    radius / 3.9, 
    game.UUM.universalColorManager.getRandomColor(),
    new Vector(game.gameWidth / 2 + 100, game.gameHeight / 2),
    0.0039,
    new Vector(0, -45),
    false, false
));

game.add(new Circle(
    game,
    radius * 1.3,
    game.UUM.universalColorManager.getRandomColor(),
    new Vector(game.gameWidth / 2, game.gameHeight / 2),
    100000,
    new Vector(0, 0),
    false, false
));

game.gameObjects.forEach(object => {
    object.drag(false);
});

/*
 game.add(new Polygon(game, new Vector(300, 500), [
    new Vector(), new Vector(30, 0), 
    new Vector(30,30), new Vector(0,30)
], new Vector(), game.UUM.universalColorManager.getRandomColor()));
 */

game.nBodySimulator = new nBody(0.1, 0.001, 0.15, game.gameObjects);


let simulatorUpdates = [
    game.nBodySimulator
];

start(game, ctx, simulatorUpdates); //start the gameLoop

