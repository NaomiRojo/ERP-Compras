import { describe, expect, it, mock } from "bun:test";
import { render, waitFor } from "@testing-library/react";

import { useInactivityTimeout } from "./useInactivityTimeout";

type HarnessProps = {
  enabled: boolean;
  timeoutMs: number;
  onTimeout: () => void;
};

function InactivityHarness({ enabled, timeoutMs, onTimeout }: HarnessProps) {
  useInactivityTimeout({ enabled, timeoutMs, onTimeout });

  return <div>Inactivity harness</div>;
}

const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("useInactivityTimeout", () => {
  it("ejecuta el callback cuando no hay actividad dentro del tiempo configurado", async () => {
    const onTimeout = mock(() => {});

    render(<InactivityHarness enabled onTimeout={onTimeout} timeoutMs={30} />);

    await waitFor(() => {
      expect(onTimeout).toHaveBeenCalledTimes(1);
    }, { timeout: 250 });
  });

  it("reinicia el contador cuando detecta actividad", async () => {
    const onTimeout = mock(() => {});

    render(<InactivityHarness enabled onTimeout={onTimeout} timeoutMs={60} />);

    await sleep(30);
    window.dispatchEvent(new Event("mousemove"));
    await sleep(40);

    expect(onTimeout).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      expect(onTimeout).toHaveBeenCalledTimes(1);
    }, { timeout: 250 });
  });

  it("no programa expiracion cuando el hook esta deshabilitado", async () => {
    const onTimeout = mock(() => {});

    render(<InactivityHarness enabled={false} onTimeout={onTimeout} timeoutMs={20} />);
    await sleep(60);

    expect(onTimeout).toHaveBeenCalledTimes(0);
  });

  it("usa la version mas reciente del callback cuando cambia entre renders", async () => {
    const firstCallback = mock(() => {});
    const secondCallback = mock(() => {});

    const view = render(
      <InactivityHarness enabled onTimeout={firstCallback} timeoutMs={30} />,
    );

    view.rerender(<InactivityHarness enabled onTimeout={secondCallback} timeoutMs={30} />);

    await waitFor(() => {
      expect(secondCallback).toHaveBeenCalledTimes(1);
    }, { timeout: 250 });

    expect(firstCallback).toHaveBeenCalledTimes(0);
  });

  it("ignora actividad nueva despues de que la sesion ya expiro", async () => {
    const onTimeout = mock(() => {});

    render(<InactivityHarness enabled onTimeout={onTimeout} timeoutMs={30} />);

    await waitFor(() => {
      expect(onTimeout).toHaveBeenCalledTimes(1);
    }, { timeout: 250 });

    window.dispatchEvent(new Event("mousemove"));
    await sleep(60);

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
