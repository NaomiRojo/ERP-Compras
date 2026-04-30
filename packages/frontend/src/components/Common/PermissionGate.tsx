import type { ReactElement } from "react";
import { Tooltip } from "@mui/material";

type PermissionGateProps = {
  children: ReactElement;
  disabled?: boolean;
  reason: string;
};

export function PermissionGate({ children, disabled = false, reason }: PermissionGateProps) {
  if (!disabled) {
    return children;
  }

  return (
    <Tooltip arrow title={reason}>
      <span className="permission-disabled">{children}</span>
    </Tooltip>
  );
}
