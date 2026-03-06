import type { RevisionDto } from "../api/revisions";

export interface RevisionListProps {
  items: RevisionDto[];
}

export function RevisionList({ items }: RevisionListProps) {
  return (
    <section>
      {items.map((item) => (
        <article key={item.id}>
          <p>{item.entity_type}</p>
          <p>{item.entity_id}</p>
          <p>{item.summary.join(",")}</p>
          <p>{item.created_at}</p>
        </article>
      ))}
    </section>
  );
}
