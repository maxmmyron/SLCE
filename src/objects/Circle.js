import objectCollider from "../Physics/objectCollider.js";
import Shape from "./Shape.js";
import Error from "../Handlers/Error.js";

/**
 * Creates a circular object. this object has a few paramaters:
 *          game: the game. required param for core functionality.
 *          radius. the size of the circular object. 
 *          color: the color of the object. If this is left blank, a default of black is set as the color.
 *          posX: the starting position of the object on the X axis. Default is centered on X axis
 *          posY: the starting position of the object on the Y axis. Default is centered on Y axis
 *          density: this varaible is useful for measuring how the object reacts in bouyant simulations. default is 5.
 */
export default class circleObject extends Shape{
    /**
     * Creates a new Circle
     * @typedef {Object} Circle
     * @param {*} game - the game the object will reside in
     * @param {number} radius - radius of the circle
     * @param {string} color - color
     * @param {number} posX - starting x position
     * @param {number} posY - starting y position
     * @param {number} density - density of the object 
     * @param {number} velX - starting x velocity
     * @param {number} velY - starting y velocity
     */
    constructor(game, radius, color, posX, posY, density, velX, velY) {
        super(game, posX, posY, velX || 0, velY || 0, color);

        this.radius = radius;
        this.density = density;
        if(this.density == 0) this.density = 1;
        this.mass = ( Math.PI * (this.radius ** 2) ) * this.density;

        this.ax = 0; 
        this.ay = 0;

        this.circleCollider = new objectCollider(this.game);
    }

    /**
     * Draws the circle on the provided context
     * @param {*} ctx - the provided context
     */
    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    /**
     * updates the circle
     * @param {Object} CONSTRAINTS - provided game constraints
     * @param {Array} gameObjects - all other game objects
     * @param {number} delta - current deltaTime as defined by gameLoop
     */
    update(CONSTRAINTS, gameObjects, delta){
        if(!delta) return;

        // Drag force: Fd = -0.5 * Cd * A * rho * v * v
        var Fx = -0.5 * 0.47 * ((Math.PI * (this.radius ** 2) / 1000) / (this.radius * 3)) * this.game.environment.physics.air_density * this.vel.x * this.vel.x / this.vel.x;
        var Fy = -0.5 * 0.47 * ((Math.PI * (this.radius ** 2) / 1000) / (this.radius * 3)) * this.game.environment.physics.air_density * this.vel.y * this.vel.y / this.vel.y;

        //ternary operator. checks if force is NaN, and if it is, then replace NaN with 0. Otherwise, continue with force.
        Fx = (isNaN(Fx) ? 0 : Fx);
        Fy = (isNaN(Fy) ? 0 : Fy);

        if(this.touching){
            this.vel.x += (Fx * 1.7) + this.ax;
        }
        else{
            this.vel.x += (Fx / 10) + this.ax;
        }
        this.vel.y += (Fy / 2.5) + this.ay;

        //integrate mass into velocities, inertia

        this.x += this.vel.x;
        this.y += this.vel.y;
        
        gameObjects.forEach(element => {
            if(this != element){
                this.circleCollider.circleCollision(this, element);
                this.circleCollider.checkSphereWallHit(this);
            }
        });

        if(isNaN(this.vel.x) || isNaN(this.vel.y)){
            new Error().NaNError(this, "object's velocity is NaN");
        }
        if(isNaN(this.x) || isNaN(this.y)){
            new Error().NaNError(this, "object's position is NaN");
        }
        
        this.vel.y += this.game.environment.physics.acceleration.y;

        this.checkMove(this.keyBuffer);
    }

    /**
     * Returns the mass of a circle
     */
    getMass(){
        return this.mass;
    }
} 