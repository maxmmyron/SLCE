/*Thanks to  frankarendpoth on github (https://github.com/frankarendpoth/) 
  for the rect-rect collision reponse code. I would have ripped all of 
  my hair out if it wasn't for his code. As of now, it still needs a bit of work; 
  it is a little glitchly when colliding the horz. sides of the player with an object.*/

import Controller from "../handlers/Controller.js/index.js";

export default class RigidObject extends Controller{
    constructor(game, width, height, posX, posY, color){
        super(game);

        this.game = game;

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.size = {
            width: width,
            height: height
        };

        this.style = {
            color: color
        };

        this.constraints = {
            maxSpeed: 5,
            friction: 0.5  
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        this.pos = {
            x: posX,
            y: posY
        };
    }

    /*********************************************************************************************
    VVVVVVVVVV provided by frankarendpoth on github: https://github.com/frankarendpoth/ VVVVVVVVVV
    *********************************************************************************************/
    get cx() { return this.pos.x + this.size.width * 0.5; }
    get cy() { return this.pos.y + this.size.height * 0.5; }

    collideRectangle(rect) {

        var dx = rect.cx - this.cx;// x difference between centers
        var dy = rect.cy - this.cy;// y difference between centers
        var aw = (rect.size.width + this.size.width) * 0.5;// average width
        var ah = (rect.size.height + this.size.height) * 0.5;// average height
        console.log(dx,dy,aw,ah);

        /* If either distance is greater than the average dimension there is no collision. */
        if (Math.abs(dx) > aw || Math.abs(dy) > ah) return false;

        /* To determine which region of this rectangle the rect's center
        point is in, we have to account for the scale of the this rectangle.
        To do that, we divide dx and dy by it's width and height respectively. */
        if (Math.abs(dx / this.size.width) > Math.abs(dy / this.size.height)) {

          if (dx < 0) rect.pos.x = this.pos.x - rect.size.width;// left
          else rect.pos.x = this.pos.x + this.size.width; // right

        } else {

          if (dy < 0) rect.pos.y = this.pos.y - rect.size.height; // top
          else rect.pos.y = this.pos.y + this.size.height; // bottom
        }
        return true;
      }

    /*********************************************************************************************
    ^^^^^^^^^^ provided by frankarendpoth on github: https://github.com/frankarendpoth/ ^^^^^^^^^^
    *********************************************************************************************/

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.width, this.size.height);
    }

    update(delta){
        if(!delta) return;
        
        if(this.keyBuffer[87] == false && this.keyBuffer[83] == false) this.velocity.y = this.velocity.y * 0.8;
        if(this.keyBuffer[65] == false && this.keyBuffer[68] == false) this.velocity.x = this.velocity.x * 0.8;

        this.checkMove(this.keyBuffer);
        this.checkWallHit();
       
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
    }
} 