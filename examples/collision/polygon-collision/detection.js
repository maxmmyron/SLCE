//imports
import Game from "../../../src/core/game.js";
import {start} from "../../../src/core/gameLoop.js";

import Polygon from "../../../src/Objects/Polygon.js";
import Vector from "../../../src/Math/Vector.js";
import InputHandler from "../../../src/Handlers/InputHandler.js";
import Text from "../../../src/Objects/Text.js";
import RegularPolygon from "../../../src/Objects/RegularPolygon.js";
import Circle from "../../../src/Objects/Circle.js";
import Collider from "../../../src/physics/Collider/CollisionSystem.js";

//define a new canvas given a canvas in DOM
let canvas = document.getElementById('gameCanvas');

let ctx = canvas.getContext('2d'); //define a new drawing context on our canvas

let game = new Game(canvas); //create a new game
var a = new RegularPolygon(game, new Vector(300,500), new Vector(0,0), 45, 8, game.UUM.universalColorManager.getRandomColor(), false);
var b = new Polygon(game, new Vector(300,700), new Vector(15,0), [{x:0, y:0}, {x:30, y:0}, {x:30, y:40}, {x:15, y:15}, {x:5, y:10}], game.UUM.universalColorManager.getRandomColor());
var c = new Circle(game, 15, game.UUM.universalColorManager.getRandomColor(), new Vector(300,300), 15, new Vector(0,0));

game.add(a);
game.add(b);
game.add(c);

new InputHandler(b);

game.collider = new Collider();

let simulatorUpdates = [
    {
        'method': game.collider,
        'args': [
            a,
            b
        ]
    }
];

game.add(new Text(game, "This is test text", new Vector(game.environment.width / 2, 200), "Times New Roman", 36, game.UUM.universalColorManager.getRandomColor()));

start(game, ctx, simulatorUpdates); //start the gameLoop

