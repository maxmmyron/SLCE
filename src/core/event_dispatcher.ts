import { assert } from "../util/asserts";

/**
 * Creates a new EngineEvent object with the specified type, payload, and associated options.
 *
 * @param {EngineEvents} type the type of event to dispatch
 * @param {any} payload the payload to dispatch with the event
 * @param {string | null} comparatorKey (optional) a key to compare against when dispatching the event
 * @param {boolean} isPersistent (optional) whether the event should persist after being dispatched.
 *
 * @returns {EngineEvent} a new EngineEvent object
 */
const createEngineEvent = (type: EngineEvents, payload: any, comparatorKey: string = null, isPersistent: boolean = false): EngineEvent => {
  return {
    type,
    payload,
    comparatorKey,
    isPersistent,
  };
}

/**
 * A class that handles creation and destruction of event listeners, as well as dispatching of custom event types.
 */
export default class EventDispatcher {
  /**
   * Creates a new EventDispatcher instance.
   *
   * @constructor
   *
   * @param {HTMLCanvasElement} canvasDOM the canvas element to attach event listeners to
   * @param {boolean} isEnginePaused current pause state of engine. Used to prevent event propagation when engine is paused
   */
  constructor(canvasDOM: HTMLCanvasElement, isEnginePaused: boolean) {
    this.canvasDOM = canvasDOM;
    this.isEnginePaused = isEnginePaused;

    // Set up event listeners for each event type.
    this.eventMap.set("mousedown", this.handleMouseDown);
    this.eventMap.set("mouseup", this.handleMouseUp);
    this.eventMap.set("keydown", this.handleKeyDown);
    this.eventMap.set("keyup", this.handleKeyUp);
    this.eventMap.set("resize", null);
  }

  // ****************************************************************
  // Public defs

  /**
   * An array of current Events that have been dispatched and are waiting to be handled by the engine.
   *
   * @type {Array<EngineEvent>}
   * @default []
   */
  eventList: Array<EngineEvent> = [];

  /**
   * The current pause state of the engine. Used to prevent event propagation when engine is paused.
   * Ideally the engine pause state can be passe in as an object reference so it can be updated without
   * directly modifying the EventHandler isEnginePaused property.
   *
   * @type {boolean}
   */
  isEnginePaused: boolean;

  /**
   * Dispatches a payload to the queue for a given event if the following conditions are met:
   * 1. The event is a valid event
   * 2. The event does not have a comparably equal event in the queue (for example, two
   *    keydown events with the same keyCode)
   * 3. the engine is not paused
   *
   * @param {EngineEvent} event event instance to dispatch
   *
   * @returns {boolean} whether or not the event was dispatched
   */
  dispatch = (event: EngineEvent): boolean => {
    if (this.isEnginePaused) return false;

    // Check if an equivalent event is already in the eventList
    if (event.comparatorKey) {
      if (this.eventList.some((e) => this.areEventsEquivalent(e, event)))
        return false;
    }

    // Add event to eventList
    this.eventList.push(event);
    return true;
  };

  /**
   * Attaches all event listeners and sets up unique resizeObserver for canvas element resize events.
   */
  attachAllEvents = () => {
    for (const [event, handler] of this.eventMap) {
      switch (event) {
        case "resize":
          this.resizeObserver.observe(this.canvasDOM);
          break;
        default:
          this.canvasDOM.addEventListener(event, handler);
      }
    }
  };

  /**
   * Detaches all events from canvasDOM and resizeObserver.
   */
  detachAllEvents = () => {
    for (const [event, handler] of this.eventMap) {
      switch (event) {
        case "resize":
          this.resizeObserver.unobserve(this.canvasDOM);
          break;
        default:
          this.canvasDOM.removeEventListener(event, handler);
          break;
      }
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
  private canvasDOM;

  /**
   * A map containing event-function pairs. Specified what function to call when a given event is called.
   *
   * @private
   * @type {Map<string, Function>}
   * @default new Map()
   */
  private eventMap: Map<string, EventListener> = new Map();

  private resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;

      const onCanvasResizeEvent: EngineEvent = createEngineEvent("oncanvasresize", { width, height });

      this.dispatch(onCanvasResizeEvent);
    }
  });

  /**
   *
   * @param {*} eventA
   * @param {*} eventB
   * @param {*} comapreEventType
   * @returns {Boolean} whether or not the events are equivalent
   */
  private areEventsEquivalent = (eventA: EngineEvent, eventB: EngineEvent, compareEventType: boolean = true) => {
    if (eventA.type !== eventB.type && compareEventType) return false;

    if (eventA.comparatorKey !== eventB.comparatorKey) return false;

    if (
      eventA.payload[eventA.comparatorKey] !==
      eventB.payload[eventB.comparatorKey]
    )
      return false;

    return true;
  };

  /**
   * Removes the event persistence flag from all comparably equivalent events in the eventList.
   *
   * @param {EngineEvents} eventType The event type to check for in the event list.
   * @param {EngineEvent} comparatorEvent an event to compare against.
   */
  private removeEventPersistence = (eventType: EngineEvents, comparatorEvent: EngineEvent) => {
    // ensure comparatorEvent has a comparatorKey
    assert(comparatorEvent.comparatorKey !== null, `${comparatorEvent.type} does not have a comparator key to compare against.`);

    this.eventList.forEach((event: EngineEvent) => {
      if (this.areEventsEquivalent(event, comparatorEvent, false)) {
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
  private handleMouseDown = (e: MouseEvent) => {
    const whileMouseDownEvent: EngineEvent = createEngineEvent("whilemousedown", e, "button", true);
    const onMouseDownEvent: EngineEvent = createEngineEvent("onmousedown", e);

    this.dispatch(whileMouseDownEvent);
    this.dispatch(onMouseDownEvent);
  };

  /**
   * Handles the "mouseup" event
   *
   * @private
   * @param {*} e event payload
   */
  private handleMouseUp = (e: MouseEvent) => {
    const onMouseUpEvent: EngineEvent = createEngineEvent("onmouseup", e, "button");

    // flip matching inverse event to non-persistent
    this.removeEventPersistence("whilemousedown", onMouseUpEvent);

    this.dispatch(onMouseUpEvent);
  };

  /**
   * Handles the "keydown" event. Registers a new persistent payload that will hold through update cycles.
   *
   * @private
   * @param {*} e event payload
   */
  private handleKeyDown = (e: KeyboardEvent) => {
    const whileKeyDownEvent: EngineEvent = createEngineEvent("whilekeydown", e, "keyCode", true);
    const onKeyDownEvent: EngineEvent = createEngineEvent("onkeydown", e);

    // don't dispatch onKeyDown if whileKeyDown is already in the queue

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
   * @param {KeyboardEvent} e event payload
   */
  private handleKeyUp = (e: KeyboardEvent) => {
    const keyUpEvent: EngineEvent = createEngineEvent("onkeyup", e, "keyCode");

    // flip matching inverse event to non-persistent
    this.removeEventPersistence("whilekeydown", keyUpEvent);

    this.dispatch(keyUpEvent);
  };
}
