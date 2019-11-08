import ColorManager from "../Math/ColorManager.js";
import Temps from "./Temps.js";
import Helper from "./Helper.js";

/**
 * UUM - Universal Util Manager. Manages utilities and classes that do not need to be replicated many times over. 
 * This is more efficent that just defining one of the below objects multiple times because it keeps one instance of it. 
 * Since only one instance of these are ever needed, it unloads unnecessary bulk. yay.
 */
export default class UUM{
    constructor(){
        this.universalColorManager = new ColorManager();
        //this.tempSystems = new Temps();
        //this.helper = new Helper();
    }
}