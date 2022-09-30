export const validEvents = ["mousedown", "mouseup"];

/**
 * A series of events that can be subscribed to by actors.
 *
 * @param {HTMLCanvasElement} canvasDOM the canvas element to attach event listeners to
 * @param {Boolean} isEnginePaused current pause state of engine. Used to prevent event propagation when engine is paused
 */
export default class EventHandler {
  constructor(canvasDOM, isEnginePaused) {
    this.#canvasDOM = canvasDOM;
    this.isEnginePaused = isEnginePaused;

    this.eventQueue = [];

    this.#eventMap = new Map();

    this.#eventMap.set("mousedown", this.#handleMouseDown);
    this.#eventMap.set("mouseup", this.#handleMouseUp);
  }

  // ****************************************************************
  // Public defs

  /**
   * Dispatches a payload to the queue for a given event type.
   *
   * @param {Event} event event to dispatch to eventQueue
   * @param {*} payload - the payload to dispatch for the specified event
   */
  dispatch = (event, payload) => {
    if (this.isEnginePaused) return;

    if (validEvents.includes(event)) {
      this.eventQueue.push({ type: event, payload: payload });
    }
  };

  /**
   * Attaches all events to canvasDOM. Run at engine initialization.
   */
  attachAllEvents = () => {
    for (const [event, handler] of this.#eventMap) {
      this.#canvasDOM.addEventListener(event, handler);
    }
  };

  /**
   * Detaches all events from canvasDOM. Run at engine disposal.
   */
  detachAllEvents = () => {
    for (const [event, handler] of this.#eventMap) {
      this.#canvasDOM.removeEventListener(event, handler);
    }
  };

  // ****************************************************************
  // Private defs

  /**
   * Canvas DOM element to attach events to.
   *
   * @private
   * @type {HTMLCanvasElement}
   */
  #canvasDOM;

  /**
   * A map containing event-function pairs. Specified what function to call when a given event is called.
   *
   * @private
   * @type {Map<Event, Function>}
   */
  #eventMap;

  /**
   * Handles the "mousedown" event
   *
   * @private
   * @param {*} e event payload
   */
  #handleMouseDown = (e) => {
    console.log("dispatching mousedown event");
    this.dispatch("mousedown", e);
  };

  /**
   * Handles the "mouseup" event
   *
   * @private
   * @param {*} e event payload
   */
  #handleMouseUp = (e) => {
    console.log("dispatching mouseup event");
    this.dispatch("mouseup", e);
  };
}
