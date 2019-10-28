import Controller from "../handlers/Controller.js";
import objectCollision from "../physics/objectCollision.js";


/**CircleObject.js
 * Creates a circular object. this object has a few paramaters:
 *          game: the game. required param for core functionality.
 *          radius. the size of the circular object. 
 *          color: the color of the object. If this is left blank, a default of black is set as the color.
 *          posX: the starting position of the object on the X axis. Default is centered on X axis
 *          posY: the starting position of the object on the Y axis. Default is centered on Y axis
 *          density: this varaible is useful for measuring how the object reacts in bouyant simulations. default is 5.
 */
export default class circleObject extends Controller{
    constructor(game, radius, color, posX, posY, density, velX, velY) {
        /** pass arguments to superclass
         * Inherits game arguments, current x and y pos, and current x and y velocity.
         */
        super(game, posX, posY, velX || 0, velY || 0, color);

        this.radius = radius;
        this.density = density || 1;
        if(this.density == 0) this.density = 1;
        this.mass = ( Math.PI * (this.radius ** 2) ) * this.density;

        this.ax = 0; 
        this.ay = 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    update(CONSTRAINTS, gameObjects, delta){
        if(!delta) return;

        // Drag force: Fd = -0.5 * Cd * A * rho * v * v
        var Fx = -0.5 * 0.47 * ((Math.PI * (this.radius ** 2) / 1000) / (this.radius * 3)) * this.game.world_variables.physics_variables.air_density * this.vel.x * this.vel.x / this.vel.x;
        var Fy = -0.5 * 0.47 * ((Math.PI * (this.radius ** 2) / 1000) / (this.radius * 3)) * this.game.world_variables.physics_variables.air_density * this.vel.y * this.vel.y / this.vel.y;

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
        
        this.checkSphereWallHit(this);
        
        this.vel.y += CONSTRAINTS.PHYSICS_SETTINGS.ACCELERATION.y;

        gameObjects.forEach(element => {
            if(this != element){
                new objectCollision(CONSTRAINTS.ctx).circleCollision(this, element);
            }
        });

        this.checkMove(this.keyBuffer);
    }

    checkSphereWallHit(obj){

        if(obj.x - obj.radius < 0){
            obj.x = 0 + obj.radius;
            this.bounceSphere(obj, obj.vel.x);
        }
        if(obj.y - obj.radius < 0){
            obj.y = 0 + obj.radius;
            this.bounceSphere(obj, obj.vel.y);
        }
        if(obj.x + obj.radius > this.game.gameWidth){
            obj.x = this.game.gameWidth - obj.radius;
            this.bounceSphere(obj, obj.vel.x);
        }

        if(obj.y + obj.radius > this.game.gameHeight){
            obj.y = this.game.gameHeight - obj.radius;
            this.bounceSphere(obj, obj.vel.y);
            this.touching = true;
        }
        else this.touching = false;
    }

    bounceSphere(obj, vel){
        if(vel == obj.vel.y){
            obj.vel.y = obj.vel.y * -0.75;
        }
        else{
            obj.vel.x = obj.vel.x * -0.75;
        }
    }

    getMass(){
        return this.mass;
    }
} 