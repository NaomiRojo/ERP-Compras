import type { ReactNode } from "react";

type EditorPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function EditorPanel({ title, description, children }: EditorPanelProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}
