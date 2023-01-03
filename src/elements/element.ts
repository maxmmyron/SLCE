/**
 * The base class for all engine elements.
 */
export default class Element {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly name: string;

  readonly internalID: string;

  isQueuedForDisposal: boolean = false;

  isRenderEnabled: boolean = true;

  isTickEnabled: boolean = true;

  // ****************************************************************

  constructor(name: string) {
    this.name = name;
    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }
}
