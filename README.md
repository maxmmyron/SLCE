# SLiCE

a **s**weet **li**ttle **c**anvas **e**ngine created by [mmyron](https://mmyron.com)

## Installing

To install SLiCE, clone the repository and run `npm install` in the root directory.

Run the demo example with `npm run demo`.

## Getting Started

Slice consists of a few core classes that are used to create a game loop and manage actors:
- `engine.js`: The engine is the main class that manages the game loop and tick/draw cycles. It also manages the canvas element and provides a few useful methods for interacting with the canvas.
- `camera.js`: (unimplemented)
- `scene.js`: A scene is a collection of actors that can be directly added to the engine.
Scenes can be thought of as a `div` element: they are useful for grouping actors together and managing their visibility within the engine.
- `actor.js`: An actor is an object that can move around, interact with other actors, and be drawn to the screen.

To begin, import the engine, camera, and scene elements, and link them together:

```js
import Engine from "./src/core/engine";
import Camera from "./src/core/camera";
import Scene from "./src/core/scene";

const canvasElement = document.getElementById("game-canvas");
const engine = new Engine(canvasElement);

const camera = new Camera("camera", engine);

const scene = new Scene("scene", engine, camera);
```

We first create an engine instance using a reference to our canvas element. When creating a descendent child within the engine (like a camera or scene), we pass a reference to its parent. This allows the engine to manage the lifecycle of its children.

We can start the engine with the `start` method:

```js
engine.start();
```

which will initialize preload functions and start the game loop.

To pause or resume the engine loop, we can use the respective functions:

```js
engine.pause();
engine.resume();
```

## Adding actors

Actors are added to scenes and are managed by the engine.

```js
import Actor from "./src/objects/Actor.js";
import {vec} from "./src/math/Vector.js";

let actor = new Actor("actor", scene, {
  pos: vec(0, 0),
  vel: vec(0, 0),
  size: vec(64, 64),
});
```

### Adding textures

We can specify the actor with a series of optional properties that will be used to initialize the actor.

If we want to initialize the actor with something like a texture, we can override the async `preload` function, which is called and completed before the engine starts.

```js
import { TextureCache } from "../src/util/TextureLoader";

import texturePath from "./image.png";

actor.preload = async () => {
  let bitmap = await TextureLoader.getInstance().load(texturePath);

  actor.addTexture("textureA", bitmap);
  actor.textureID = "textureA";
};
```

### Actor animations

If we want to add an animation to the actor, we can use the same function with a few extra parameters:

```js
actor.preload = async () => {
  let animationBitmap = await TextureLoader.getInstance().load(texturePath);

  actor.addTexture("textureA", bitmap, vec(64, 64), 200);
  actor.textureID = "textureA";
};
```

The `addTexture` function takes a few extra parameters:
- `frameSize`: the size of each frame in the animation. This is used to calculate the number of frames in the animation, as well as where clip the overall bitmap to get each frame.
- `frameDuration`: the duration of each frame in the animation, in ms

## Listeners

Listeners are functions that are called when their respective events are dispatched by the engine. Listeners can be added to actors, scenes, and the engine.

The engine has a few listeners that can be used to perform custom logic:

| event type       | description                         | persistent? | persists until | strictly filtered?
| ---------------- | ----------------------------------- | ----------- | -------------- | ------------------
| `onmousedown`    | called when a mouse key is pressed  | no          | -              | -
| `whilemousedown` | called while a mouse key is pressed | yes         | "onmouseup"    | yes
| `onmouseup`      | called when a mouse key is released | no          | -              | -
| `onmousemove`    | called when the mouse is moved      | no          | -              | -
| `onkeydown`      | called when a key is pressed        | no          | -              | -
| `whilekeydown`   | called while a key is pressed       | yes         | "onkeyup"      | yes
| `onkeyup`        | called when a key is released       | no          | -              | -
| `onresize`       | called when the window is resized   | no          | -              | -
| `ontick`         | called every tick                   | no          | -              | -
| `onrender`       | called every draw                   | no          | -              | -

The above table shows the event types, their descriptions, and a few other helpful properties:
- `persistent`: whether the event persists beyond a single tick. If the event is persistent, it will be called every tick until the event type that it `persists until` is dispatched.
- `persists until`: the event type that will cause remove the persistent event.
- `strictly filtered`: whether the event should undergo a more strict filter process. If true, then the event will check against not only an events type, but also its payload. This is useful for events that can exist with multiple payloads like `whilekeydown`.

Each event has a payload that is passed to the listener function. The payload is an object contains the data relevant to the event. The payload for each event is listed below:

| event type       | payload                             | description
| ---------------- | ----------------------------------- | ---------------------------
| `onmousedown`    | `{ x: number, y: number }`          | mouse position
| `whilemousedown` | `{ x: number, y: number }`          | mouse position
| `onmouseup`      | `{ x: number, y: number }`          | mouse position
| `onmousemove`    | `{ x: number, y: number }`          | mouse position
| `onkeydown`      | `{ key: string }`                   | pressed key name
| `whilekeydown`   | `{ key: string }`                   | pressed key name
| `onkeyup`        | `{ key: string }`                   | released key name
| `onresize`       | `{ width: number, height: number }` | new window size
| `ontick`         | `{ deltaTime: number }`             | tick time in ms
| `onrender`       | `{ interpolationFactor: number }`   | render interpolation factor

Listeners can be added to various elements in the engine using the `addListener` function:

```js
actor.addListener("onmousedown", (e) => {
  console.log("mouse down");
});
```

Listeners can be removed using the `removeListener` function, so long as a reference to the listener is passed in:

```js
const listener = (e) => {/* ... */};

actor.addListener("onmousedown", listener);

// ...

actor.removeListener("onmousedown", listener);
```

We can use listeners to add some simple movement logic to our actor:

```js
actor.addListener("onkeydown", (e) => {
  // reset the actor to its original position
  if (e.key === "r") {
    actor.vel = vec();
    actor.setPosition(vec(/* some position */));
  }
});

actor.addListener("whilekeydown", (e) => {
  // add a bit of velocity based on the key pressed
  if (e.key === "ArrowRight") actor.vel.x += 0.01;
  if (e.key === "ArrowLeft") actor.vel.x += -0.01;
  if (e.key === "ArrowUp") actor.vel.y += -0.01;
  if (e.key === "ArrowDown") actor.vel.y += 0.01;

  // clamp the velocity within a reasonable range
  actor.vel.x = Math.min(Math.max(actor.vel.x, -0.5), 0.5);
  actor.vel.y = Math.min(Math.max(actor.vel.y, -0.5), 0.5);
});

actor.addListener("ontick", (e) => {
  // factor in the current delta time so we stay hardware independent.
  actor.pos.x += actor.vel.x * e.deltaTime;
  actor.pos.y += actor.vel.y * e.deltaTime;
});
```

Note the use of the `setPosition()` function. This is used to immediately set the position of an actor without accounting for render interpolation.
