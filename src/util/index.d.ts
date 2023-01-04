type ValidEventPayload =
  | { button: number, x: number, y: number }          // mouse events
  | { key: string }     // key events
  | { width: number, height: number } // resize event
  | { deltaTime: number }             // tick event
  | { interpolationFactor: number }   // render event

/**
 * @typedef EventHandler A singleton that handles event subscription,
 * unsubscription, and dispatching.
 *
 * @property {function} addListener Adds a listener to an event.
 * @property {function} removeListener Removes a listener from an event.
 * @property {function} addToQueue Adds an event to the queue.
 * @property {function} removeFromQueue Removes an event from the queue.
 * @property {function} dispatchQueue Dispatches all events in the queue.
 */
type EventHandler = {
  addListener: (type: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => void,
  removeListener: (type: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => void,
  queueEvent: (type: ValidEventType, payload: ValidEventPayload, isPersistent?: boolean, comparisonType?: string) => void,
  dequeueEvent: (type: ValidEventType) => void,
  dispatchQueue: () => void,
  getQueuedEvents: () => Array<QueuedEvent>,
  setIsEnginePaused: (isPaused: boolean) => void,
  attachEventListeners: (canvas: HTMLCanvasElement) => void,
  detachEventListeners: () => void
}

/**
 * @typedef QueuedEvent An event that has been queued for dispatch. A queued
 * event will dispatch on the next tick cycle, and will be removed from the
 * queue (if isPersistent is false) after its execution.
 *
 * @property {ValidEventType} type The name of the event to dispatch.
 * @property {Event} event The event to dispatch.
 * @property {boolean} isPersistent Whether or not the event should persist
 * until the event name described in persistUntil is called, or until the event
 * is explicitly removed from the queue.
 * @property {string} comparisonType The name of the event to compare against
 * checking if the event should still persist.
 */
type QueuedEvent = {
  type: ValidEventType,
  payload: ValidEventPayload,
  isPersistent: boolean,
  comparisonType: string
}

/**
 * @typedef ValidEventType The names of all valid events.
 */
type ValidEventType =
  | "onmousedown"
  | "whilemousedown"
  | "onmouseup"
  | "onmousemove"
  | "onkeydown"
  | "whilekeydown"
  | "onkeyup"
  | "onresize"
  | "ontick"
  | "onrender";

interface TextureLoader {
  load(path: string): Promise<ImageBitmap>;
}
