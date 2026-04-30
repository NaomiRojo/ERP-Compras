import { useEffect, useRef } from "react";

type UseInactivityTimeoutOptions = {
  enabled: boolean;
  timeoutMs: number;
  onTimeout: () => void;
};

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "focus",
  "keydown",
  "mousedown",
  "mousemove",
  "scroll",
  "touchstart",
];

export function useInactivityTimeout({
  enabled,
  timeoutMs,
  onTimeout,
}: UseInactivityTimeoutOptions): void {
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!enabled || timeoutMs <= 0 || typeof window === "undefined") {
      return;
    }

    let timeoutId: number | null = null;
    let expired = false;

    const clearTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const armTimer = () => {
      clearTimer();
      timeoutId = window.setTimeout(() => {
        expired = true;
        onTimeoutRef.current();
      }, timeoutMs);
    };

    const registerActivity = () => {
      if (expired) {
        return;
      }

      armTimer();
    };

    armTimer();

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, registerActivity, { passive: true });
    }

    return () => {
      clearTimer();

      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, registerActivity);
      }
    };
  }, [enabled, timeoutMs]);
}
