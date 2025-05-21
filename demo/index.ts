/// <reference types="vite/client" />

import {createCamera} from "../src/camera";
import {createGameEngine} from "../src/engine";
import {createScene} from "../src/scene";
import { createActor } from "../src/actor";
import characterSpritemap from "./characterSpritemap.png";

const canvas = document.getElementById("c") as HTMLCanvasElement;
const context = canvas.getContext("2d");

const engine = createGameEngine(context!);

const actor = createActor({ id: "actor1", x: 100, y: 100, width: 100, height: 100 });
const scene = createScene({ id: "scene1", name: "abc", actors: [ actor ] });

engine.dispatch({ type: "ADD_SCENE", scene });
engine.dispatch({ type: "SET_ACTIVE_SCENE", id: "scene1" });

const camera = createCamera({ id: "cam1", x: 0, y: 0 });
engine.dispatch({ type: "ADD_CAMERA", camera })
engine.dispatch({ type: "SET_ACTIVE_CAMERA", id: "cam1" });

engine.start();
engine.dispatch({ type: "SET_PAUSE_STATE", pauseState: false });
console.log(engine.getEngineState());