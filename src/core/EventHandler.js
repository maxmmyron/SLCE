/**
 * An array containing all valid event types that can be handled by the engine.
 *
 * @type {string[]}
 */
export const EVENT_IDENTIFIERS = [
  "onmousedown",
  "whilemousedown",
  "onmouseup",
  "onkeydown",
  "whilekeydown",
  "onkeyup",
];

/**
 * A utility class that handles a custom Event class.
 */
class Event {
  /**
   * Creates a new Event.
   *
   * @constructor
   *
   * @param {String} type event type. Serves as a unique identifier for the event.
   * @param {*} payload data associated with the event.
   * @param {String | null} comparatorKey a key to compare events with. If null, the event will not be compared.
   * @param {Boolean} isPersistent whether or not the event should be removed from the event list after it is handled.
   */
  constructor(type, payload, comparatorKey = null, isPersistent = false) {
    this.type = type;
    this.payload = payload;
    this.comparatorKey = comparatorKey;
    this.isPersistent = isPersistent;
  }

  /**
   * The type of event. Used as an "ID" of sorts and is what is used to determine what event handler to call.
   *
   * @type {String}
   */
  type;

  /**
   * The payload of the event. This data is passed to the event handler for the event type in question.
   *
   * @type {*}
   */
  payload;

  /**
   * Key that can be used to compare one event to another. This is useful for events that are persistent,
   * and need to be manually updated to remove. If null, then the event will not be compared against and,
   * if persistent, will be queued for removal after the event's inverse is recieved (for example, a keyup
   * event).
   *
   * @type {String | null}
   * @default null
   */
  comparatorKey = null;

  /**
   * Whether or not this event should remain within the event list over multiple update cycles.
   * If true, then the event will be removed from the event list after a seperate event dispatch
   * asks to remove it from the event list.
   *
   * @type {boolean}
   * @default false
   */
  isPersistent = false;
}

/**
 * A class that handles creation and destruction of eventlistners, as well as dispatching of custom event types.
 */
export default class EventHandler {
  /**
   * Creates a new EventHandler instance.
   *
   * @constructor
   *
   * @param {HTMLCanvasElement} canvasDOM the canvas element to attach event listeners to
   * @param {Boolean} isEnginePaused current pause state of engine. Used to prevent event propagation when engine is paused
   */
  constructor(canvasDOM, isEnginePaused) {
    this.#canvasDOM = canvasDOM;
    this.isEnginePaused = isEnginePaused;

    // Set up event listeners for each event type.
    this.#eventMap.set("mousedown", this.#handleMouseDown);
    this.#eventMap.set("mouseup", this.#handleMouseUp);
    this.#eventMap.set("keydown", this.#handleKeyDown);
    this.#eventMap.set("keyup", this.#handleKeyUp);
  }

  // ****************************************************************
  // Public defs

  /**
   * An array of current Events that have been dispatched and are waiting to be handled by the engine.
   *
   * @type {Event[]}
   * @default []
   */
  eventList = [];

  /**
   * The current pause state of the engine. Used to prevent event propagation when engine is paused.
   * Ideally the engine pause state can be passe in as an object reference so it can be updated without
   * directly modifying the EventHandler isEnginePaused property.
   *
   * @type {Boolean}
   */
  isEnginePaused;

  /**
   * Dispatches a payload to the queue for a given event if the following conditions are met:
   * 1. The event is a valid event
   * 2. The event does not have a comparably equal event in the queue (for example, two
   *    keydown events with the same keyCode)
   * 3. the engine is not paused
   *
   * @param {Event} event event instance to dispatch
   *
   * @returns {Boolean} whether or not the event was dispatched
   */
  dispatch = (event) => {
    if (this.isEnginePaused) return false;

    // Check if event type is valid
    if (!EVENT_IDENTIFIERS.includes(event.type))
      throw new Error(
        `Error dispatching event: ${event.type} is not a valid event type.`
      );

    // Check if an equivalent event is already in the eventList
    if (event.comparatorKey) {
      if (this.eventList.some((e) => this.#areEventsEquivalent(e, event)))
        return false;
    }

    // Add event to eventList
    this.eventList.push(event);
    return true;
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
   * @default new Map()
   */
  #eventMap = new Map();

  /**
   *
   * @param {*} eventA
   * @param {*} eventB
   * @param {*} comapreEventType
   * @returns {Boolean} whether or not the events are equivalent
   */
  #areEventsEquivalent = (eventA, eventB, comapreEventType = true) => {
    if (eventA.type !== eventB.type && comapreEventType) return false;

    if (eventA.comparatorKey !== eventB.comparatorKey) return false;

    if (
      eventA.payload[eventA.comparatorKey] !==
      eventB.payload[eventB.comparatorKey]
    )
      return false;

    return true;
  };

  /**
   *
   * @param {String} eventType The event type to check for in the event list.
   * @param {Event} comparatorEvent an event to compare against.
   */
  #removeEventPersistence = (eventType, comparatorEvent) => {
    // ensure comparatorEvent has a comparatorKey
    if (comparatorEvent.comparatorKey === null)
      throw new Error(
        `Event ${comparatorEvent.type} does not have a comparator key compare against.`
      );

    this.eventList.forEach((event) => {
      if (this.#areEventsEquivalent(event, comparatorEvent, false)) {
        event.isPersistent = false;
      }
    });
  };

  /**
   * Handles the "mousedown" event
   *
   * @private
   * @param {*} e event payload
   */
  #handleMouseDown = (e) => {
    let whileMouseDownEvent = new Event("whilemousedown", e, "button", true);
    let onMouseDownEvent = new Event("onmousedown", e);

    this.dispatch(whileMouseDownEvent);
    this.dispatch(onMouseDownEvent);
  };

  /**
   * Handles the "mouseup" event
   *
   * @private
   * @param {*} e event payload
   */
  #handleMouseUp = (e) => {
    let onMouseUpEvent = new Event("onmouseup", e, "button");

    // flip matching inverse event to non-persistent
    this.#removeEventPersistence("whilemousedown", onMouseUpEvent);

    this.dispatch(onMouseUpEvent);
  };

  /**
   * Handles the "keydown" event. Registers a new persistent payload that will hold through update cycles.
   *
   * @private
   * @param {*} e event payload
   */
  #handleKeyDown = (e) => {
    let whileKeyDownEvent = new Event("whilekeydown", e, "keyCode", true);
    let onKeyDownEvent = new Event("onkeydown", e);

    // dont dispatch onKeyDown if whileKeyDown is already in the queue

    if (
      !this.eventList.some(
        (event) =>
          event.type === "whilekeydown" && event.payload.keyCode === e.keyCode
      )
    )
      this.dispatch(onKeyDownEvent);

    this.dispatch(whileKeyDownEvent);
  };

  /**
   * Handles the "keyup" event. Removes the persistent payload that was registered on respective keydown event.
   *
   * @private
   * @param {*} e event payload
   */
  #handleKeyUp = (e) => {
    let keyUpEvent = new Event("onkeyup", e, "keyCode");

    // flip matching inverse event to non-persistent
    this.#removeEventPersistence("whilekeydown", keyUpEvent);

    this.dispatch(keyUpEvent);
  };
}
