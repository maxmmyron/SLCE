import { EVENT_IDENTIFIERS } from "./EventDispatcher";

/**
 * Subscribed to and handles events dispatched by the EventDispatcher.
 */
export default class EventSubscriber {
  /**
   *
   */
  constructor() {}

  /**
   * An array containing a series of structs that list out subscribed events and their respective callbacks.
   *
   * @type {Array}
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
   *
   * @param {*} eventType
   * @param {*} callback
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

    // add a new struct to subscribedEvent array if it doesn't already exist
    if (!specifiedEvent) {
      this.subscribedEvents.push({ type: eventType, callbacks: [callback] });
    }

    // add callback to subscribedEvent struct as element in array if it exists
    else {
      specifiedEvent.callbacks.push(callback);
    }
  }

  /**
   *
   * @param {*} eventType
   */
  unsubscribe = (eventType) => {};
}
