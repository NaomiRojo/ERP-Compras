import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import type { Metric } from "../../types";

const KPI_ACCENTS = ["#2156d9", "#0f766e", "#b45309", "#be123c"];

export function KpiGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <Box
      component="section"
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { lg: "repeat(4, minmax(0, 1fr))", md: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
      }}
    >
      {metrics.map((metric, index) => {
        const accent = KPI_ACCENTS[index % KPI_ACCENTS.length];

        return (
        <Paper
          component="article"
          key={metric.label}
          sx={{
            borderColor: "rgba(20, 32, 51, 0.08)",
            overflow: "hidden",
            p: 2.25,
            position: "relative",
          }}
          variant="outlined"
        >
          <Box sx={{ bgcolor: accent, height: 4, insetInline: 0, position: "absolute", top: 0 }} />
          <Stack spacing={1.1}>
            <Chip
              label={metric.label}
              size="small"
              sx={{ alignSelf: "flex-start", bgcolor: `${accent}14`, color: accent, fontWeight: 800 }}
            />
            <Typography component="strong" sx={{ color: "#142033", fontSize: 28, fontWeight: 850, lineHeight: 1.05 }}>
              {metric.value}
            </Typography>
            <Typography color="text.secondary" component="span" variant="body2">
              {metric.hint}
            </Typography>
          </Stack>
        </Paper>
        );
      })}
    </Box>
  );
}
