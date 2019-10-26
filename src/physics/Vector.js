/**
 * This is currently unused. I would like to refactor 
 * a majority of the code to use clean vectors, so 
 * instead of defining a velocity with "this.vel.x = a; 
 * and this.vel.y = b;, it would just be defined with 
 * this.vel = new Vector(a, b). That would be a lot cleaner."
 */

export default class Vector{
    constructor(x, y){
        this.x = x || 0;
        this.y = y || 0;
    }
}