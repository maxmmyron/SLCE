
/**
 * Creates a new handler for dealing with mouse data.
 */
export default class MouseHandler {

    /**
     * 
     * @param {string} event - the event to be passed. Examples include "click", "mousemove", etc. Defaults to "click".
     */
    constructor(event){
        this.event = event || "click";
        document.addEventListener(this.event, (e) => {

            if(this.event == "click") this.clicked = true;
            else this.clicked = false;

            if(this.event == "mousemove"){
                this.mx = e.clientX;
                this.my = e.clientY;
            }
            
            this.eventData = e;
        });
    }

    /**
     * returns the current eventData stored by the mouse handler.
     */
    getEvent(){
        return this.eventData;
    }

    /**
     * logs the eventData.
     */
    logEvent(){
        console.log(this.eventData);
    }
}