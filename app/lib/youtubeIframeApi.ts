export const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';

declare global {
  interface Window {
    YT: any;
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

  const firstScriptTag = document.getElementsByTagName('script')[0];
  if (firstScriptTag?.parentNode) {
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
  } else {
    const parent = document.head ?? document.body ?? document.documentElement;
    parent.appendChild(script);
  }

  return script;
}

export function loadYouTubeIframeApi(): Promise<void> {
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

    const resolveReady = () => {
      previousReadyHandler?.();
      if (window.onYouTubeIframeAPIReady === resolveReady) {
        window.onYouTubeIframeAPIReady = previousReadyHandler;
      }
      resolve();
    };

    script.onerror = (event, source, lineno, colno, error) => {
      if (typeof previousErrorHandler === 'function') {
        previousErrorHandler.call(script, event, source, lineno, colno, error);
      }
      apiLoadPromise = null;
      reject(error ?? new Error('YouTube IFrame API failed to load'));
    };

    window.onYouTubeIframeAPIReady = resolveReady;
  });

  return apiLoadPromise;
}
