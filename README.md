# SLiCE

a **s**weet **li**ttle **c**anvas **e**ngine created by [mmyron](https://mmyron.com)

## Installing

To install SLiCE, clone the repository and run `npm install` in the root directory.

Run the demo project with `npm run demo`.

## Getting Started

To begin, import the Engine class and create a new instance that is bound to a canvas element.

```javascript
import Engine from "./src/core/engine.js";

const canvasElement = document.getElementById("gameCanvas");

let engine = new Engine(canvasElement);
```

### Adding actors

Actors are what interacts with the SLiCE engine. The can take many forms and are designed to be abstract in order to allow for a wide range of use cases.

```javascript
import Actor from "./src/objects/Actor.js";
import {vec} from "./src/math/Vector.js";

let actor = new Actor({
  pos: vec(400, 400)
  size: vec(64,64)
});
```

Actors can accept a preload function that will be called before the engine starts, allowing for asynchronous loading of assets.

```javascript
import texturePath from "./image.png";

actor.preload(async () => {
  actor.addTextureLayer(
    new TextureLayer(texturePath, {
      isActive: true,
      size: vec(64, 64),
    })
  );
});
```

Likewise, actors can accept an update or draw function that is called every frame.

The draw update accepts a canvas context object that can be used to called canvas draw functions.

The update function accepts a delta time parameter that can be used to calculate movement based on the time since the last frame, as well as an environment object from the engine that contains useful information about the engine state.

```javascript
player.draw = (ctx) => {
  // perform draw updates
};

player.update = (dt, env) => {
  // perform update logic
};
```

Actors can subscribe to events dispatched by the engine. Events are dispatched by the engine when certain conditions are met, like when a mouse or key is pressed.

```javascript
actor.subscribe("whilekeydown", (e) => {
  if (e.key === "ArrowRight") {
    actor.vel.x = 5;
  } else if (e.key === "ArrowLeft") {
    player.vel.x = -5;
  }
});
```

Actors can be added to the engine with the `addActor` method:

```javascript
engine.addActor(actor);
```

Actors can also be removed from the engine with the `removeActor` method:

```javascript
engine.removeActor(actor);
```

### Managing the engine

The engine can be started with the `start` method. This method will run all actor preload functions and will initialize the engine loop.

```javascript
engine.start();
```

Pausing and resuming the engine can be done with the `pause` and `resume` methods, respectively.

```javascript
engine.pause();
engine.resume();
```

Like actors, the engine has its own update and draw functions that can be overridden to perform custom logic:

```javascript
engine.draw = (ctx) => {
  // perform draw updates
};

engine.update = (dt, env) => {
  // perform update logic
};
```
