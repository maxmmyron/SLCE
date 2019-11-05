import Controller from "../Handlers/Controller.js";
import Vector from "../Math/Vector.js";

/**
 * A Universal Object Manager. Allows for controller, universal object settings, etc.
 */

export default class UOM extends Controller {
    constructor(game, pos, vel, color){
        super(game);

        this.game = game;

        this.vel = vel || new Vector();

        this.pos = pos || new Vector();

        this.style = {
            color: color || "rgba(0,0,0,1)"
        };

        this.constraints = {maxSpeed: 30};
    }
}