import { Paper, Typography } from "@mui/material";

import type { Metric } from "../../types";

export function KpiGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="metrics-grid">
      {metrics.map((metric) => (
        <Paper className="metric-card" component="article" key={metric.label}>
          <Typography color="text.secondary">{metric.label}</Typography>
          <Typography component="strong" variant="h5">
            {metric.value}
          </Typography>
          <Typography color="text.secondary" component="span">
            {metric.hint}
          </Typography>
        </Paper>
      ))}
    </section>
  );
}
