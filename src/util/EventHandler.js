/**
 * Utility class for handling events fired by the engine and actors.
 */
export default class EventHandler {
  /**
   * handles customs events
   * @param {Array<String>} validEvents - an array of valid event names
   */
  constructor(validEvents, isSingle = false) {
    this.validEvents = validEvents;

    this.isSingle = isSingle;

    // construct eventHandler object from validEvents array
    if (this.isSingle) {
      validEvents.forEach((validEvent) => {
        this.eventHandlers[validEvent] = null;
      });
    } else {
      validEvents.forEach((validEvent) => {
        this.eventHandlers[validEvent] = [];
      });
    }
  }

  // ****************************************************************
  // Public defs

  /**
   * Object containing all events for relevant events
   *
   * @type {Object}
   */
  eventHandlers = {};

  /**
   * Whether or not only a single event handler may be added to an event.
   *
   * @type {Boolean}
   * @default false
   */
  isSingle;

  /**
   * An array of valid events
   *
   * @type {Array<String>}
   */
  validEvents = [];

  /**
   * Adds a callback to the event callback list. If isSingle is true and a callback is already registered to the event, the callback will not be added.
   *
   * @param {String} event - event type to handle
   * @param {Function} callback - function to execute when event is triggered
   *
   * @returns {Boolean} true if callback was added, false if callback was not added
   *
   * @throws {Error} if event is not a string
   * @throws {Error} if callback is not a function
   * @throws {Error} if event is not a valid event
   *
   */
  addEventHandler = (event, callback) => {
    // assert event is a string
    if (typeof event !== "string") throw new Error("event must be a string");
    // assert handler is a function
    if (typeof callback !== "function")
      throw new Error("handler must be a function");
    // assert event is a valid event
    if (!this.validEvents.includes(event))
      throw new Error("event is not a valid event");

    // if isSingle is true, only allow one handler per event
    if (this.isSingle) {
      if (this.eventHandlers[event]) return false;
      this.eventHandlers[event] = callback;
      return true;
    }

    // add handler function to array of handlers for specified event
    this.eventHandlers[event].push(callback);
    return true;
  };

  /**
   * Removes an event handler from the event handler list.
   *
   * @param {String} event - event type to remove handler from
   * @param {Function} callback - function to remove from event
   *
   * @return {Boolean} true if handler was removed, false otherwise
   *
   * @throws {Error} if event is not a string
   * @throws {Error} if handler is not a function
   * @throws {Error} if event is not a valid event
   */
  removeEventHandler = (event, callback) => {
    // assert event is a string
    if (typeof event !== "string") throw new Error("event must be a string");
    // assert handler is a function
    if (typeof callback !== "function")
      throw new Error("handler must be a function");
    // assert event is a valid event
    if (!this.validEvents.includes(event))
      throw new Error("event is not a valid event");

    // if isSingle is true, only allow one handler per event
    if (this.isSingle) {
      if (this.eventHandlers[event] !== callback) return false;
      this.eventHandlers[event] = null;
      return true;
    }

    // remove callback from array of callbacks registered to specified event
    const index = this.eventHandlers[event].indexOf(callback);
    if (index !== -1) {
      this.eventHandlers[event].splice(index, 1);
      return true;
    }
    return false;
  };
}
