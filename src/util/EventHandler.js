/**
 * Utility class for handling events fired by the engine and actors.
 */
export default class EventHandler {
  /**
   * handles customs events
   * @param {Array<String>} validEvents - an array of valid event names
   */
  constructor(validEvents) {
    this.validEvents = validEvents;

    // construct eventHandler object from validEvents array
    validEvents.forEach(validEvent => {
      this.eventHandlers[validEvent] = [];
    })
  }

  // ****************************************************************
  // Public defs

  /**
   * An array of valid events
   * @type {Array<String>}
   */
  validEvents = [];

  /**
   * Object containing all events for relevant events
   * @type {Object}
   */
  eventHandlers = {};

  /**
   * Adds an event handler to the event handler list.
   * @param {String} event - event type to handle
   * @param {Function} handler - function to execute when event is triggered
   * 
   * @throws {Error} if event is not a string
   * @throws {Error} if handler is not a function
   * @throws {Error} if event is not a valid event
   */
  addHandler(event, handler) {
    // assert event is a string
    if (typeof event !== "string") throw new Error("event must be a string");
    // assert handler is a function
    if (typeof handler !== "function") throw new Error("handler must be a function");
    // assert event is a valid event
    if (!this.validEvents.includes(event)) throw new Error("event is not a valid event");

    // add handler function to array of handlers for specified event
    this.eventHandlers[event].push(handler);
  }

  /**
   * Adds an asyncrhonous event handler to the event handler list.
   * @param {String} event - event type to handle
   * @param {Function} handler - function to execute when event is triggered
   * 
   * @throws {Error} if event is not a string
   * @throws {Error} if handler is not a function
   * @throws {Error} if event is not a valid event
   */
  addAsyncHandler(event, handler) {
    // assert event is a string
    if (typeof event !== "string") throw new Error("event must be a string");
    // assert handler is a function
    if (typeof handler !== "function") throw new Error("handler must be a function");
    // assert event is a valid event
    if (!this.validEvents.includes(event)) throw new Error("event is not a valid event");

    // add handler function to array of handlers for specified event

    this.eventHandlers[event].push(handler);
  }


  /**
   * Removes an event handler from the event handler list.
   * 
   * @param {String} event - event type to remove handler from
   * @param {Function} handler - function to remove from event
   * 
   * @return {Boolean} true if handler was removed, false otherwise
   * 
   * @throws {Error} if event is not a string
   * @throws {Error} if handler is not a function
   * @throws {Error} if event is not a valid event
   */
  removeHandler(event, handler) {
    // assert event is a string
    if (typeof event !== "string") throw new Error("event must be a string");
    // assert handler is a function
    if (typeof handler !== "function") throw new Error("handler must be a function");
    // assert event is a valid event
    if (!this.validEvents.includes(event)) throw new Error("event is not a valid event");

    // remove handler function from array of handlers for specified event
    const index = this.eventHandlers[event].indexOf(handler);
    if (index !== -1) {
      this.eventHandlers[event].splice(index, 1);
      return true;
    }
    return false;
  }
}