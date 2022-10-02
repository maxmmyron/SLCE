export const validEvents = ["mousedown", "mouseup", "keydown", "keyup"];

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
    this.#eventMap.set("keydown", this.#handleKeyDown);
    this.#eventMap.set("keyup", this.#handleKeyUp);
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

  handlePersistentEvents = () => {
    this.#persistentEvents.forEach((event) => {
      this.dispatch(event.event, event.payload);
    });
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

  #persistentEvents = [];

  #addPersistentEvent = (event, payload) => {
    this.#persistentEvents.push({ event, payload });
  };

  #removePersistentEvent = (event, payload) => {
    this.#persistentEvents = this.#persistentEvents.filter(
      (persistentPayload) =>
        persistentPayload.event !== event &&
        persistentPayload.payload !== payload
    );
  };

  /**
   * Handles the "mousedown" event
   *
   * @private
   * @param {*} e event payload
   */
  #handleMouseDown = (e) => {
    this.dispatch("mousedown", e);
  };

  /**
   * Handles the "mouseup" event
   *
   * @private
   * @param {*} e event payload
   */
  #handleMouseUp = (e) => {
    this.dispatch("mouseup", e);
  };

  /**
   * Handles the "keydown" event. Registers a new persistent payload that will hold through update cycles.
   *
   * @private
   * @param {*} e event payload
   */
  #handleKeyDown = (e) => {
    this.#addPersistentEvent("keydown", e);
  };

  /**
   * Handles the "keyup" event. Removes the persistent payload that was registered on respective keydown event.
   *
   * @private
   * @param {*} e event payload
   */
  #handleKeyUp = (e) => {
    // remove keydown event and payload from persistent events
    this.#removePersistentEvent("keydown", e);

    this.dispatch("keyup", e);
  };
}
