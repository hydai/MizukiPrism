export const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';
export const YOUTUBE_IFRAME_API_LOAD_TIMEOUT_MS = 10000;
const YOUTUBE_IFRAME_API_STATUS_ATTRIBUTE = 'data-youtube-iframe-api-status';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

export function isYouTubeIframeApiReady(): boolean {
  return typeof window !== 'undefined' && Boolean(window.YT?.Player);
}

function getExistingYouTubeIframeApiScript(): HTMLScriptElement | null {
  return document.querySelector<HTMLScriptElement>(
    `script[src="${YOUTUBE_IFRAME_API_SRC}"]`,
  );
}

function insertYouTubeIframeApiScript(): HTMLScriptElement {
  const existingScript = getExistingYouTubeIframeApiScript();
  if (existingScript) return existingScript;

  const script = document.createElement('script');
  script.src = YOUTUBE_IFRAME_API_SRC;
  script.setAttribute(YOUTUBE_IFRAME_API_STATUS_ATTRIBUTE, 'loading');

  const firstScriptTag = document.getElementsByTagName('script')[0];
  if (firstScriptTag?.parentNode) {
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
  } else {
    const parent = document.head ?? document.body ?? document.documentElement;
    parent.appendChild(script);
  }

  return script;
}

function removeFailedYouTubeIframeApiScript(script: HTMLScriptElement): void {
  if (!isYouTubeIframeApiReady() && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('YouTube IFrame API can only be loaded in a browser'));
  }

  if (isYouTubeIframeApiReady()) {
    return Promise.resolve();
  }

  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise((resolve, reject) => {
    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    const script = insertYouTubeIframeApiScript();
    const previousErrorHandler = script.onerror;
    let isSettled = false;

    const restoreReadyHandler = (): void => {
      if (window.onYouTubeIframeAPIReady === resolveReady) {
        window.onYouTubeIframeAPIReady = previousReadyHandler;
      }
    };

    const restoreErrorHandler = (): void => {
      if (script.onerror === handleError) {
        script.onerror = previousErrorHandler;
      }
    };

    const rejectLoad = (error: unknown): void => {
      if (isSettled) return;
      isSettled = true;
      restoreReadyHandler();
      restoreErrorHandler();
      removeFailedYouTubeIframeApiScript(script);
      apiLoadPromise = null;
      reject(error instanceof Error ? error : new Error('YouTube IFrame API failed to load'));
    };

    function resolveReady(): void {
      if (isSettled) return;
      isSettled = true;
      restoreReadyHandler();
      restoreErrorHandler();
      script.setAttribute(YOUTUBE_IFRAME_API_STATUS_ATTRIBUTE, 'ready');
      let previousHandlerError: unknown;
      let didPreviousHandlerThrow = false;

      try {
        previousReadyHandler?.call(window);
      } catch (error) {
        previousHandlerError = error;
        didPreviousHandlerThrow = true;
      } finally {
        resolve();
      }

      if (didPreviousHandlerThrow) {
        throw previousHandlerError;
      }
    }

    const handleError: OnErrorEventHandler = (event, source, lineno, colno, error) => {
      let previousHandlerError: unknown;
      let didPreviousHandlerThrow = false;

      if (typeof previousErrorHandler === 'function') {
        try {
          previousErrorHandler.call(script, event, source, lineno, colno, error);
        } catch (handlerError) {
          previousHandlerError = handlerError;
          didPreviousHandlerThrow = true;
        }
      }

      rejectLoad(error ?? previousHandlerError);

      if (didPreviousHandlerThrow) {
        throw previousHandlerError;
      }
    };

    script.onerror = handleError;
    window.onYouTubeIframeAPIReady = resolveReady;

    if (isYouTubeIframeApiReady()) {
      resolveReady();
    }
  });

  return apiLoadPromise;
}
