import type { ReactNode } from "react";
import { Paper, Stack, Typography } from "@mui/material";

type EditorPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function EditorPanel({ title, description, children }: EditorPanelProps) {
  return (
    <Paper className="panel" component="section">
      <Stack className="panel__header">
        <div>
          <Typography component="h3" variant="h6">
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
        </div>
      </Stack>

      {children}
    </Paper>
  );
}
