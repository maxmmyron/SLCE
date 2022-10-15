/**
 * Subscribes to valid events dispatched by the EventDispatcher, and runs specified callbacks.
 *
 * @class
 */
export default class EventSubscriber {
  /**
   * A map containing key value pairs of event types and arrays of respective callbacks.
   *
   * @type {Map<EngineEvents, Array<Function>>}
   * @default new Map()
   */
  subscribedEvents: Map<EngineEvents, Array<Function>> = new Map();

  /**
   * Subscribed to a new event type with a callback. If the event type is already subscribed to,
   * the callback is added to the list of callbacks for that event type.
   *
   * @param {EngineEvents} eventType the event type to subscribe to
   * @param {Function} callback a callback to execute when the event is dispatched
   */
  subscribe = (eventType: EngineEvents, callback: Function) => {
    if(this.subscribedEvents.has(eventType)) {
      const currentCallbacks = this.subscribedEvents.get(eventType);
      this.subscribedEvents.set(eventType, [...currentCallbacks, callback]);
    } else {
      this.subscribedEvents.set(eventType, [callback]);
    }
  }

  /**
   * Removes a callback from a subscribed event type. If the event type has no more callbacks, the event type is removed from the subscribedEvents array.
   * If the event type is not subscribed to, nothing happens.
   * If a callback parameter is not specified, all callbacks for the event type are removed.
   *
   * @param {String} eventType - event type to unsubscribe from
   * @param {Function} callback - (optional) callback to remove from event type
   *
   * @throws {Error} if the event type is not a valid event type
   */
  unsubscribe = (eventType: EngineEvents, callback: Function = null): boolean => {
    if(!this.subscribedEvents.has(eventType)) return;

    const currentCallbacks = this.subscribedEvents.get(eventType);
    if (callback) {
      const callbackIndex = currentCallbacks.indexOf(callback);
      if (callbackIndex !== -1) {
        currentCallbacks.splice(callbackIndex, 1);
        return true;
      }
    } else {
      currentCallbacks.splice(0, currentCallbacks.length);
      return true;
    }
    if (currentCallbacks.length === 0) {
      this.subscribedEvents.delete(eventType);
      return true;
    }
    return false;
  };
}
