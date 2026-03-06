export interface CtaCardProps {
  title: string;
  hint: string;
  href: string;
  actionLabel: string;
}

export function CtaCard({ title, hint, href, actionLabel }: CtaCardProps) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{hint}</p>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {actionLabel}
      </a>
    </section>
  );
}
