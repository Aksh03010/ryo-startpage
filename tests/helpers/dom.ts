import { Window as HappyWindow } from 'happy-dom';

type TestWindow = Window &
  Pick<
    typeof globalThis,
    | 'Event'
    | 'MouseEvent'
    | 'KeyboardEvent'
    | 'HTMLElement'
    | 'HTMLInputElement'
    | 'Node'
    | 'MutationObserver'
    | 'ResizeObserver'
  > & { happyDOM: HappyWindow['happyDOM'] };

/** Happy DOM implements the browser APIs exercised by these tests, with Node timer types. */
export function createTestWindow(
  options?: ConstructorParameters<typeof HappyWindow>[0],
): TestWindow {
  return new HappyWindow(options) as unknown as TestWindow;
}

export function installTestGlobals(window: TestWindow): void {
  const bindings = {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    HTMLInputElement: window.HTMLInputElement,
    Node: window.Node,
    Event: window.Event,
    MouseEvent: window.MouseEvent,
    KeyboardEvent: window.KeyboardEvent,
    MutationObserver: window.MutationObserver,
    ResizeObserver: window.ResizeObserver,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  };
  for (const [key, value] of Object.entries(bindings)) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
}
