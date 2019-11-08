import Error from "../Handlers/Error.js";
import UOM from "./UOM.js";
import CircleCollider from "../physics/Collider/CircleCollider.js";
import Vector from "../Math/Vector.js";

/**
 * Creates a new circle
 */
export default class Circle extends UOM{

     /**
      * Circle constructor
      * @param {*} game - the game the circle will reside in
      * @param {number} radius - radius of the circle
      * @param {string} color - color
      * @param {Vector} pos - starting position
      * @param {number} density - density of the circle
      * @param {Vector} vel - starting velocity
      * @param {boolean} collides - if the circle will collide with other objects.
      * @param {boolean} bounded - if the circle will rebound off the canvas edges
      * @param {boolean} hasDrag - if the circle will experience air resistance
      */
    constructor(game, radius, color, pos, density, vel, collides = true, bounded = true, hasDrag = true) {
        super(game, pos, vel, color);

        this.radius = radius;
        this.density = density;
        if(this.density == 0) this.density = 1;
        this.mass = ( Math.PI * (this.radius ** 2) ) * this.density;

        this.ax = 0; 
        this.ay = 0;

        this.collidesWithObjects = collides;
        this.boundByCanvas = bounded;

        this.collider = new CircleCollider(this.game, this);
        this.errorManager = new Error();

        this.hasDrag = hasDrag;
    }

    /**
     * Draws the circle on the provided context
     * @param {*} ctx - the provided context
     */
    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, false);
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

        Fx = (this.hasDrag ? Fx : 0);
        Fy = (this.hasDrag ? Fy : 0);

        if(this.touching){
            this.vel.x += (Fx * 1.7) + this.ax;
        }
        else{
            this.vel.x += (Fx / 10) + this.ax;
        }
        this.vel.y += (Fy / 2.5) + this.ay;

        //integrate mass into velocities, inertia

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        if(this.collidesWithObjects){
            gameObjects.forEach(element => {
                if(this != element && element.collidesWithObjects){
                    this.collider.obj2 = element;
                    this.collider.runUpdates();
                }
            });
        }
        else if(this.boundByCanvas){
            this.collider.checkSphereWallHit(this);
        }
        if(isNaN(this.vel.x) || isNaN(this.vel.y)){
            this.collider.NaNError(this, "object's velocity is NaN");
        }
        if(isNaN(this.pos.x) || isNaN(this.pos.y)){
            this.collider.NaNError(this, "object's position is NaN");
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

    getType(){
        return "circle";
    }

    drag(hasDrag){
        this.hasDrag = hasDrag;
    }
} 