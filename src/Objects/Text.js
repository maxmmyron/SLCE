import Vector from "../Math/Vector.js";

export default class Text{
    /**
     * 
     * @param {*} game 
     * @param {String} text - The text to display.
     * @param {Vector} pos - The position of the text.
     * @param {String} font - Font to displa the text in. Default is Arial.
     * @param {Number} fontsize - font size at which to dispaly the text. Default is 12.
     * @param {String} color - a hex color
     */
    constructor(game, text, pos, font, fontsize, color){
        this.game = game;
        this.text = text;
        this.pos = pos || new Vector();
        this.font = fontsize + "px " + font;
        this.color = color || game.UUM.UniversalColorManager.getRandomColor();
    }

    update(){}
    draw(){
        this.game.ctx.fillStyle = this.color;
        this.game.ctx.font = this.font;
        this.game.ctx.fillText(this.text, this.pos.x, this.pos.y);
        this.game.ctx.fillStyle = this.game.environment.defaults.fill_color;
        this.game.ctx.font = this.game.environment.defaults.default_font;
        
    }

    getType(){
        return "text";
    }
}