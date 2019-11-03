
# SLCE

###### (pronounced "slice")

 a **s**weet **l**ittle **c**anvas **e**ngine created by [mmyron](https://mmyron.com/)
  

## What is SLCE?
SLCE is a pure-javascript canvas engine. It was formed with a few basic principles in mind:
-  **Organization**
   - Everything in SCLE is built with organization in mind. Creating, deleting, and manipulating objects should be a simple process.
- **Iteration**
  - SCLE was built for quick, successive iteration, both on the developer and end-user side. Updates are pushed quickly, and users are encouraged to use debugging capabilities to experiment quickly and efficently.
- **Stability**
  - SCLE is built with stability in mind. An ongoing goal is to be able to run simulations with a high number of objects at high frame rates. It is also a common goal to quickly isolate the root causes of bugs, and eliminate them with minimal change to end-user functionality.
- **Accessibility**
  - SCLE is built to be accessable for users who are new to JavaScript, yet still powerful for those who would like to tinker with the programming themselves.

## Dependencies

Luckily, SLCE is built using pure javascript. No JQuery, no nothing. However, ECMA Script is used for necessary imports, so it is reccomended that your editor of choice is configured to properly recognise ECMAScript 6 features.

## Getting Started

To begin any SCLE project, you must create an instance of the engine. You may do this by first importing the game class.
```import Game from "src/core/game.js"```

You will also want to import the start function from the core gameLoop file, in order to run the engine.
```import {start} from  "./core/gameLoop.js";```

Then, define the canvas (and canvas context) that SCLE will render onto.
```
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
```

You can then define a new Game, with the only input needed being the canavs to render onto.
`let game =  new Game(canvas);`

Finally, we can start the game with our start function from the gameLoop import.
```
start(game, ctx);
```

Our final JavaScript file will look something like this:
```
import Game from  "./core/game.js";
import {start} from  "./core/gameLoop.js";

//define a new canvas given a canvas in DOM
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d'); //define a new drawing context on our canvas

let game =  new Game(canvas); //create a new game

start(game, ctx); //start the gameLoop
```

## Adding Objects
We can use the add function in the game class to add a new object to the list of game objects.  Luckily, this method allows us to add objects quickly and efficently. We can declare new objects inside the add method itself, to keep it condensed. 
Here is an example of adding a new circle using the game class' add function:
```
game.add(new circleObject(game, 5, new Color().getRandomColor(), 500, 500, 5, 0, 0));
```
This will create a circle with a radius of five, a random color, an x position and y position of 500 pixels (from the top left), and x and v velocities of zero.

## Adding Physics
We can add physics to our game from our main class as well. It is not dissimilar to adding objects, however instead of adding physics through a function, we can define them with variables within the game class.
As an example, here is a definition of a new simulator that will calculate (and update) the positions, velocities, and accelerations of the gameObjects onscreen:
```
game.nBodySimulator =  new nBody(1, 0.001, 100, game.gameObjects);
```
While we now have a simulator, it won't actually be updating the positions, velocities, or accelerations of the gameObjects. We have to pass through the respective update functions of each simulator we create. We can do this by defining a new array and adding our simulators update methods into it: 
```
let simulatorUpdates = [
	game.nBodySimulator.updatePositionVectors(),
	game.nBodySimulator.updateVelocityVectors(),
	game.nBodySimulator.updateAccelerationVectors()
];
```
Then, we can add our defined array (in this case `simulatorUpdates[]`)  to the arguments of our start method.
```
start(game, ctx, simulatorUpdates);
```
(In the future, this will be much easier to do.  Simulators will have their own "get update methods" method to ease this process further).