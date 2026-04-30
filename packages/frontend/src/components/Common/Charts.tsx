import type { ReactNode } from "react";
import { Box, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";

export type ChartPoint = {
  label: string;
  value: number;
};

export type DonutSegment = {
  label: string;
  value: number;
  color?: string;
};

type ChartCardProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

function ChartCard({ children, description, title }: ChartCardProps) {
  return (
    <Paper sx={{ p: 2.5, height: "100%" }} variant="outlined">
      <Stack spacing={2}>
        <Box>
          <Typography component="h3" variant="h6">
            {title}
          </Typography>
          {description ? (
            <Typography color="text.secondary" variant="body2">
              {description}
            </Typography>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}

const formatCompact = (value: number): string =>
  new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);

const maxValue = (points: ChartPoint[]): number =>
  Math.max(1, ...points.map((point) => point.value));

const emptyPoints = (points: ChartPoint[]): boolean =>
  points.every((point) => point.value === 0);

type LineChartCardProps = {
  color?: string;
  description?: string;
  points: ChartPoint[];
  title: string;
  valuePrefix?: string;
};

export function LineChartCard({
  color,
  description,
  points,
  title,
  valuePrefix = "",
}: LineChartCardProps) {
  const theme = useTheme();
  const lineColor = color ?? theme.palette.primary.main;
  const width = 640;
  const height = 260;
  const padding = { bottom: 42, left: 54, right: 18, top: 22 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maximum = maxValue(points);
  const gradientId = `line-gradient-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;
  const coordinates = points.map((point, index) => {
    const x = padding.left + index * stepX;
    const y = padding.top + chartHeight - (point.value / maximum) * chartHeight;
    return { ...point, x, y };
  });
  const path = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const firstCoordinate = coordinates[0];
  const lastCoordinate = coordinates[coordinates.length - 1];
  const areaPath = coordinates.length
    ? `${path} L ${lastCoordinate!.x} ${padding.top + chartHeight} L ${firstCoordinate!.x} ${padding.top + chartHeight} Z`
    : "";
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <ChartCard description={description} title={title}>
      <Box sx={{ overflow: "hidden", width: "100%" }}>
        <svg aria-label={title} role="img" viewBox={`0 0 ${width} ${height}`} width="100%">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.24" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect fill="transparent" height={height} width={width} />
          {gridLines.map((line) => {
            const y = padding.top + chartHeight - line * chartHeight;
            return (
              <g key={line}>
                <line stroke="#dbe3f1" strokeDasharray="4 6" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
                <text fill="#60708c" fontSize="11" textAnchor="end" x={padding.left - 10} y={y + 4}>
                  {valuePrefix}
                  {formatCompact(maximum * line)}
                </text>
              </g>
            );
          })}
          {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
          {path ? (
            <path d={path} fill="none" stroke={lineColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          ) : null}
          {coordinates.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} fill="#fff" r="6" stroke={lineColor} strokeWidth="3" />
              <text fill="#60708c" fontSize="11" textAnchor="middle" x={point.x} y={height - 14}>
                {point.label}
              </text>
            </g>
          ))}
          {emptyPoints(points) ? (
            <text fill="#60708c" fontSize="14" textAnchor="middle" x={width / 2} y={height / 2}>
              Sin datos para graficar
            </text>
          ) : null}
        </svg>
      </Box>
    </ChartCard>
  );
}

type BarChartCardProps = {
  color?: string;
  description?: string;
  points: ChartPoint[];
  title: string;
  valuePrefix?: string;
};

export function BarChartCard({
  color,
  description,
  points,
  title,
  valuePrefix = "",
}: BarChartCardProps) {
  const theme = useTheme();
  const barColor = color ?? theme.palette.secondary.main;
  const maximum = maxValue(points);

  return (
    <ChartCard description={description} title={title}>
      <Stack spacing={1.4}>
        {points.map((point) => {
          const percentage = Math.max(3, (point.value / maximum) * 100);

          return (
            <Box key={point.label}>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2">{point.label}</Typography>
                <Typography sx={{ fontWeight: 700 }} variant="body2">
                  {valuePrefix}
                  {formatCompact(point.value)}
                </Typography>
              </Stack>
              <Box
                sx={{
                  bgcolor: "rgba(96, 112, 140, 0.14)",
                  borderRadius: 999,
                  height: 10,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    bgcolor: barColor,
                    borderRadius: 999,
                    height: "100%",
                    transition: "width 180ms ease",
                    width: `${percentage}%`,
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </ChartCard>
  );
}

type DonutChartCardProps = {
  description?: string;
  segments: DonutSegment[];
  title: string;
};

export function DonutChartCard({ description, segments, title }: DonutChartCardProps) {
  const theme = useTheme();
  const palette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    "#64748b",
  ];
  const total = segments.reduce((accumulator, segment) => accumulator + segment.value, 0);
  let offset = 25;

  return (
    <ChartCard description={description} title={title}>
      <Stack direction={{ sm: "row", xs: "column" }} spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{ width: 180 }}>
          <svg aria-label={title} role="img" viewBox="0 0 120 120" width="100%">
            <circle cx="60" cy="60" fill="none" r="42" stroke="#dbe3f1" strokeWidth="18" />
            {segments.map((segment, index) => {
              const strokeDasharray =
                total > 0 ? `${(segment.value / total) * 264} ${264 - (segment.value / total) * 264}` : "0 264";
              const currentOffset = offset;
              offset -= total > 0 ? (segment.value / total) * 264 : 0;

              return (
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  key={segment.label}
                  r="42"
                  stroke={segment.color ?? palette[index % palette.length]}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={currentOffset}
                  strokeLinecap="round"
                  strokeWidth="18"
                  transform="rotate(-90 60 60)"
                />
              );
            })}
            <text fill="#142033" fontSize="20" fontWeight="800" textAnchor="middle" x="60" y="58">
              {total}
            </text>
            <text fill="#60708c" fontSize="10" textAnchor="middle" x="60" y="74">
              total
            </text>
          </svg>
        </Box>
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          {segments.map((segment, index) => (
            <Stack direction="row" key={segment.label} spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Chip
                label={segment.label}
                size="small"
                sx={{
                  borderColor: segment.color ?? palette[index % palette.length],
                  color: segment.color ?? palette[index % palette.length],
                  maxWidth: 180,
                }}
                variant="outlined"
              />
              <Typography sx={{ fontWeight: 700 }}>{segment.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </ChartCard>
  );
}
