import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIdleTimer } from "./use-idle-timer";

describe("useIdleTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls onIdle after timeoutMs without user activity", () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimer({
        timeoutMs: 10000,
        onIdle,
        enabled: true,
      })
    );

    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("resets timer on user activity if throttle time passed", () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimer({
        timeoutMs: 10000,
        throttleMs: 1000,
        onIdle,
        enabled: true,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Avanzar tiempo real de actividad para pasar el throttle
    vi.setSystemTime(Date.now() + 2000);

    // Simular actividad del usuario
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Avanzar otros 5000ms (Total 10000ms desde el inicio pero reset por actividad)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onIdle).not.toHaveBeenCalled();

    // Avanzar 5000ms más para alcanzar el timeout desde la última actividad
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onIdle if enabled is false", () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimer({
        timeoutMs: 10000,
        onIdle,
        enabled: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(onIdle).not.toHaveBeenCalled();
  });
});
