declare global {
    interface Window {
      YT: typeof YT;
      onYouTubeIframeAPIReady: (() => void) | undefined;
    }
  }
  