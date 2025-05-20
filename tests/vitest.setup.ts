// tests/vitest.setup.js
import { beforeEach, vi } from 'vitest';

// Mock performance.now() to control time in tests
let mockTime = 0;
vi.spyOn(performance, 'now').mockImplementation(() => mockTime);

// Mock requestAnimationFrame and cancelAnimationFrame
// This allows us to manually tick the game loop in tests
let rAFCallbacks: { [key: number]: FrameRequestCallback } = {};
let nextFrameId = 0;
vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
  const id = nextFrameId++;
  rAFCallbacks[id] = callback;
  return id;
});

vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
  delete rAFCallbacks[id];
});

// Helper to advance time and trigger animation frames
// @ts-ignore
export function advanceTimeAndFrames (ms: number): void {
  mockTime += ms;
  // Execute all scheduled rAF callbacks
  const callbacksToRun = Object.values(rAFCallbacks);
  rAFCallbacks = {}; // Clear for next frame
  callbacksToRun.forEach(callback => callback(mockTime));
};

// Reset mocks before each test
beforeEach(() => {
  mockTime = 0;
  rAFCallbacks = {};
  nextFrameId = 0;
  vi.mocked(performance.now).mockImplementation(() => mockTime);
  vi.mocked(window.requestAnimationFrame).mockImplementation((callback) => {
    const id = nextFrameId++;
    rAFCallbacks[id] = callback;
    return id;
  });
  vi.mocked(window.cancelAnimationFrame).mockImplementation((id) => {
    delete rAFCallbacks[id];
  });
});

// Mock console.warn to suppress it during tests
vi.spyOn(console, 'warn').mockImplementation(() => {});