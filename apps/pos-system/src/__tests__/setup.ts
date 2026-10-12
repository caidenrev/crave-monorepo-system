import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Polyfill matchMedia untuk komponen Radix UI
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Polyfill ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock AudioContext untuk cashier-sound
if (!window.AudioContext) {
  (window as unknown as { AudioContext: typeof AudioContext }).AudioContext =
    class {
      createBufferSource() {
        return { connect: () => {}, start: () => {}, stop: () => {} };
      }
      createBiquadFilter() {
        return { connect: () => {}, type: "", frequency: { value: 0 }, Q: { value: 0 } };
      }
      createGain() {
        return { connect: () => {}, gain: { value: 0, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } };
      }
      createDynamicsCompressor() {
        return { connect: () => {} };
      }
      createBuffer() {
        return { getChannelData: () => new Float32Array(0) };
      }
      get destination() {
        return {};
      }
      get currentTime() {
        return 0;
      }
      get sampleRate() {
        return 44100;
      }
      get state() {
        return "running";
      }
      resume() {}
    } as unknown as typeof AudioContext;
}

// Reset localStorage sebelum setiap test
beforeEach(() => {
  localStorage.clear();
});
