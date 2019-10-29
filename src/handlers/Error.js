/**
 * Creates a new error message. Useful for debugging.
 */
export default class Error{
    constructor(){}

    /**
     * Prints a custom NaN Error message and logs useful data to view where the NaN value is coming from. 
     * @param {Object} object - the object that the error came from.
     * @param {string} message - a custom message to print.
     */
    NaNError(object, message){
        let customMessage = message || "";
        console.log(object);
        if(customMessage == ""){
            throw "NaN Error";
        }
        else{
            throw "NaN Error: " + message;
        }
    }
}