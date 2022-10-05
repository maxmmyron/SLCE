import { EVENT_IDENTIFIERS } from "./EventDispatcher";

/**
 * Subscribes to valid events dispatched by the EventDispatcher, and runs specified callbacks.
 *
 * @class
 */
export default class EventSubscriber {
  /**
   * An array containing a series of structs that list out subscribed events and their respective callbacks.
   *
   * @type {Array}
   * @default []
   *
   * @example
   * [{
   *     type: "click",
   *     callbacks: [()=>{...}, ()=>{...}]
   * },
   * {
   *     type: "...",
   *     callbacks: [()=>{}]
   * }]
   */
  subscribedEvents = [];

  /**
   * Subscribed to a new event type with a callback. If the event type is already subscribed to,
   * the callback is added to the list of callbacks for that event type.
   *
   * @param {String} eventType the event type to subscribe to
   * @param {Function} callback a callback to execute when the event is dispatched
   *
   * @throws {Error} if the event type is not a valid event type
   */
  subscribe(eventType, callback) {
    // ensure event is valid from engine event list
    if (!EVENT_IDENTIFIERS.includes(eventType)) {
      throw new Error(
        `Error attempting to subscribe to invalid event ${eventType}: Event does not exist in validEvents list.`
      );
    }

    const specifiedEvent = this.subscribedEvents.find(
      (subscribedEvent) => subscribedEvent.event === eventType
    );

    if (!specifiedEvent) {
      // add a new struct to subscribedEvent array if it doesn't already exist
      this.subscribedEvents.push({ type: eventType, callbacks: [callback] });
    } else {
      // add callback to subscribedEvent struct as element in array if it exists
      specifiedEvent.callbacks.push(callback);
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
  unsubscribe = (eventType, callback = null) => {};
}
