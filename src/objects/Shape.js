import Controller from "../handlers/Controller.js";

/**
 * Creates a new controller. This controller class is what is used to take control of an object and manupulate it around the screen.
 */

export default class Shape extends Controller {
    constructor(game, posX, posY, velX, velY, color){
        super(game);

        this.game = game;

        this.vel = {
            x: velX,
            y: velY
        };

        this.x = posX || game.gameWidth / 2;
        this.y = posY || game.gameHeight / 2;

        this.style = {
            color: color || "rgba(0,0,0,1)"
        };

        this.constraints = {maxSpeed: 30};
    }
}