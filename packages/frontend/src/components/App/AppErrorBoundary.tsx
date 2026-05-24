import { Component, type ErrorInfo, type ReactNode } from "react";

import { ServerErrorScreen } from "../../screens/ServerError";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public override state: AppErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  private onReload = () => {
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ServerErrorScreen
          actionLabel="Recargar aplicacion"
          description="Ocurrio un error inesperado en la interfaz. Puedes recargar para volver al ultimo estado estable."
          onPrimaryAction={this.onReload}
          title="Se detecto un error en la aplicacion"
        />
      );
    }

    return this.props.children;
  }
}
