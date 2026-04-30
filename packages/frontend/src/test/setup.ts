import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
});

const { window } = dom;

Object.assign(globalThis, {
  document: window.document,
  navigator: window.navigator,
  window,
});

for (const key of [
  "DocumentFragment",
  "Element",
  "Event",
  "FocusEvent",
  "HTMLElement",
  "HTMLInputElement",
  "KeyboardEvent",
  "MouseEvent",
  "Node",
  "SVGElement",
  "Text",
  "getComputedStyle",
  "MutationObserver",
]) {
  if (key in window) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: window[key as keyof Window],
    });
  }
}

const reactActEnvironmentGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

reactActEnvironmentGlobal.IS_REACT_ACT_ENVIRONMENT = true;

if (!window.HTMLElement.prototype.attachEvent) {
  window.HTMLElement.prototype.attachEvent = () => {};
}

if (!window.HTMLElement.prototype.detachEvent) {
  window.HTMLElement.prototype.detachEvent = () => {};
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 0) as unknown as number;
}

if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (handle: number) => clearTimeout(handle);
}

afterEach(() => {
  cleanup();
  window.document.body.innerHTML = "";
});
