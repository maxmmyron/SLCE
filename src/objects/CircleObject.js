import Controller from "../handlers/Controller.js";


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
        //pass arguments to superclass
        super(game, posX, posY, velX || 0, velY || 0);
        
        this.radius = radius;

        this.style = {
            color: color || "rgba(0,0,0,1)"
        };

        this.constraints = {maxSpeed: 30};

        this.density = density || 5;
        this.mass = this.density * (Math.PI * (this.radius ** 2));

        this.cD = 0.47; 
        this.rho = this.game.world_variables.physics_variables.air_density;
        this.A = (Math.PI * (radius ** 2) / 1000) / (radius * 3);
        this.acc = game.WORLD_CONSTRAINTS.PHYSICS_SETTINGS.ACCELERATION.y;
    }

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    update(CONSTRAINTS, delta){
        if(!delta) return;

        // Drag force: Fd = -0.5 * Cd * A * rho * v * v
        var Fx = -0.5 * this.cD * this.A * this.rho * this.vel.x * this.vel.x / this.vel.x;
        var Fy = -0.5 * this.cD * this.A * this.rho * this.vel.y * this.vel.y / this.vel.y;

        //ternary operator. checks if force is NaN, and if it is, then replace NaN with 0. Otherwise, continue with force.
        Fx = (isNaN(Fx) ? 0 : Fx);
        Fy = (isNaN(Fy) ? 0 : Fy);

        //because mass isn't correctly implemented into an object, this does not have the intended effect.
        //var aX = Fx / this.mass;
        //var aY = (Fy / this.mass);

        if(this.touching){
            this.vel.x += Fx * 1.7;
        }
        else{
            this.vel.x += Fx / 10;
        }
        this.vel.y += Fy / 2.5;

        //integrate mass into velocities, inertia

        this.x += this.vel.x;
        this.y += this.vel.y;
        
        this.checkSphereWallHit(this);
        this.vel.y += CONSTRAINTS.PHYSICS_SETTINGS.ACCELERATION.y;

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
} 