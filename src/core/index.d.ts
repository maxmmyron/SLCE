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
  addListener: (name: ValidEventName, callback: ((ev: any) => void)) => void,
  removeListener: (name: ValidEventName, callback: ((ev: any) => void)) => void,
  addToQueue: (name: ValidEventName, event: any, isPersistent?: boolean, persistUntil?: string) => void,
  removeFromQueue: (name: ValidEventName) => void,
  dispatchQueue: () => void,
  getQueuedEvents: () => Array<QueuedEvent>,
  setIsEnginePaused: (isPaused: boolean) => void
}

/**
 * @typedef QueuedEvent An event that has been queued for dispatch. A queued
 * event will dispatch on the next tick cycle, and will be removed from the
 * queue (if isPersistent is false) after its execution.
 *
 * @property {ValidEventName} name The name of the event to dispatch.
 * @property {Event} event The event to dispatch.
 * @property {boolean} isPersistent Whether or not the event should persist
 * until the event name described in persistUntil is called, or until the event
 * is explicitly removed from the queue.
 * @property {string} persistUntil The name of the event to persist until.
 * If isPersistent is true and persistUntil is an empty string, the event will
 * persist until explicitly removed from the queue.
 */
type QueuedEvent = {
  name: ValidEventName,
  event: Event,
  isPersistent: boolean,
  persistUntil: string
}

/**
 * @typedef ValidEventName The names of all valid events.
 */
type ValidEventName =
  "onmousedown" |
  "whilemousedown" |
  "onmouseup" |
  "onkeydown" |
  "whilekeydown" |
  "onkeyup" |
  "oncanvasresize" |
  "ontick" |
  "onrender";

type CameraOptions = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}

type SceneOptions = {
  environment?: SceneEnvironment
}

type SceneEnvironment = {
  background: string;
  gravity: Vector;
}
