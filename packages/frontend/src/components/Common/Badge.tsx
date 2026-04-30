import type { ReactNode } from "react";
import { Chip } from "@mui/material";

import type { BadgeTone } from "../../types";

type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
};

export function Badge({ tone, children }: BadgeProps) {
  const color = tone === "success" ? "success" : tone === "warning" ? "warning" : "default";

  return (
    <Chip
      className={`status-badge status-badge--${tone}`}
      color={color}
      component="span"
      label={children}
      size="small"
      variant={tone === "neutral" ? "outlined" : "filled"}
    />
  );
}
