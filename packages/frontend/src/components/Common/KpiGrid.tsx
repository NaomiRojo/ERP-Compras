import type { Metric } from "../../types";

export function KpiGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="metrics-grid">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <p>{metric.label}</p>
          <strong>{metric.value}</strong>
          <span>{metric.hint}</span>
        </article>
      ))}
    </section>
  );
}
