/**
 * Creates a new controller. This controller class is what is used to take control of an object and manupulate it around the screen.
 */

export default class Controller {
    constructor(game, posX, posY, velX, velY){
        this.game = game;

        this.keyBuffer = [];

        //default values for W,S,A,D
        this.keyBuffer[87] = false;
        this.keyBuffer[83] = false;
        this.keyBuffer[65] = false;
        this.keyBuffer[68] = false;

        this.vel = {
            x: velX,
            y: velY
        };

        this.x = posX || game.gameWidth / 2;
        this.y = posY || game.gameHeight / 2;

        this.touching = false;
    }

    checkMove(buffer){
        if(buffer[87] && this.vel.y >= -this.constraints.maxSpeed && this.touching == true) {
            this.vel.y = -30;
            this.touching = false;
        }
        if(buffer[83] && this.vel.y < this.constraints.maxSpeed) this.vel.y++; //this doesn't really do anything, given that every object is immutably responsive to gravity.
        if(buffer[65] && this.vel.x >= -this.constraints.maxSpeed) this.vel.x =- 20;
        if(buffer[68] && this.vel.x <= this.constraints.maxSpeed) this.vel.x =+ 20;
    }

    //this block of code sorts the x values and y values of each point on a polygon, and then checks if the max and min of those values are touching the hardcoded canvas boundaries.
    checkWallHit(obj){
        let xPoints = [], yPoints = [];
        for(var i = 0; i < obj.points.length; i++){
            xPoints.push(obj.points[i].x);
            yPoints.push(obj.points[i].y);
        }

        xPoints.sort(); 
        let mX = xPoints[xPoints.length - 1];
        yPoints.sort();
        let mY = yPoints[yPoints.length - 1];
        

        if(obj.x < 0){
            obj.vel.x = 0;
            obj.x = 0;
        }
        if(obj.y < 0){
            obj.vel.y = 0;
            obj.y = 0;
        }
        if(obj.x + mX > this.game.gameWidth){
            obj.vel.x = 0;
            obj.x = this.game.gameWidth - mX;
        }
        if(obj.y + mY > this.game.gameHeight){
            obj.vel.y = 0;
            obj.y = this.game.gameHeight - mY;
            this.touching = true;
        }
    }
}