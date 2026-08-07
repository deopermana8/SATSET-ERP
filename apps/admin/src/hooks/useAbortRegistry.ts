export type AbortRegistry = {
  track: (controller: AbortController) => void;
  release: (controller: AbortController) => void;
  abortAll: (reason?: string) => void;
};

export function createAbortRegistry(): AbortRegistry {
  const controllers = new Set<AbortController>();
  return {
    track(controller: AbortController): void {
      controllers.add(controller);
    },
    release(controller: AbortController): void {
      controllers.delete(controller);
    },
    abortAll(reason?: string): void {
      for (const controller of controllers) {
        controller.abort(reason);
      }
      controllers.clear();
    },
  };
}
