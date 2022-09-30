/**
 * Creates a new controller. This controller class is what is used to take control of an object and manupulate it around the screen.
 */

export default class Controller {
  constructor(game, controllerType) {
    this.game = game;

    this.keyBuffer = [];

    //default values for W,S,A,D
    this.keyBuffer[87] = false; // W
    this.keyBuffer[83] = false; // S
    this.keyBuffer[65] = false; // A
    this.keyBuffer[68] = false; // D

    this.touching = false;
    this.controllerType = controllerType || 0;
  }

  checkMove(buffer) {
    if (this.controllerType == 0) {
      if (buffer[87] && this.vel.x >= -this.constraints.maxSpeed)
        this.vel.y = -20;
      if (buffer[83] && this.vel.x <= this.constraints.maxSpeed)
        this.vel.y = +20;
      if (buffer[65] && this.vel.x >= -this.constraints.maxSpeed)
        this.vel.x = -20;
      if (buffer[68] && this.vel.x <= this.constraints.maxSpeed)
        this.vel.x = +20;
    }
    if (this.controllerType == 1) {
      if (
        buffer[87] &&
        this.vel.y >= -this.constraints.maxSpeed &&
        this.touching == true
      ) {
        this.vel.y = -30;
        this.touching = false;
      }
      if (buffer[83] && this.vel.y < this.constraints.maxSpeed) this.vel.y++; //this doesn't really do anything, given that every object is immutably responsive to gravity.
      if (buffer[65] && this.vel.x >= -this.constraints.maxSpeed)
        this.vel.x = -20;
      if (buffer[68] && this.vel.x <= this.constraints.maxSpeed)
        this.vel.x = +20;
    }
  }
}
