import type { ReactNode } from "react";

import type { BadgeTone } from "../../types";

type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
};

export function Badge({ tone, children }: BadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}
