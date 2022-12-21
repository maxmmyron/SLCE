/**
 * Subscribes to valid events dispatched by the EventDispatcher, and runs specified callbacks.
 *
 * @class
 */
export default class EventSubscriber {
  /**
   * A map containing key value pairs of event types and arrays of respective callbacks.
   */
  subscribedEvents: Map<EngineEvents, Array<Function>> = new Map<EngineEvents, Array<Function>>();

  /**
   * Subscribes to a new event type with a callback. If the event type is already subscribed to,
   * the callback is added to the list of callbacks for that event type.
   *
   * @param eventType the event type to subscribe to
   * @param callback a callback to execute when the event is dispatched
   */
  subscribe = (eventType: EngineEvents, callback: Function) => this.subscribedEvents.set(eventType, [...this.subscribedEvents.get(eventType) || [], callback]);

  /**
   * Removes a callback from a subscribed event type. If the event type has no more callbacks, the event type is removed from the subscribedEvents array.
   * If the event type is not subscribed to, nothing happens.
   * If a callback parameter is not specified, all callbacks for the event type are removed.
   *
   * @param eventType - event type to unsubscribe from
   * @param callback - (optional) callback to remove from event type
   *
   * @throws {Error} if the event type is not a valid event type
   */
  unsubscribe = (eventType: EngineEvents, callback: Function | null = null): boolean => {
    if (!this.subscribedEvents.has(eventType)) return false;

    let currentCallbacks: Function[] = this.subscribedEvents.get(eventType) as Function[];

    // If no callback is specified, remove all callbacks for the event type
    if (!callback) {
      currentCallbacks.splice(0, currentCallbacks.length);
      return true;
    }

    // If a callback is specified, remove it from the list of callbacks for the event type
    const callbackIndex = currentCallbacks.indexOf(callback as Function);
    if (callbackIndex !== -1) {
      currentCallbacks.splice(callbackIndex, 1)
      return true
    }

    // If the event type has no more callbacks, remove it from the subscribedEvents array
    if (currentCallbacks.length === 0) {
      this.subscribedEvents.delete(eventType);
      return true;
    }

    return false;
  };
}
