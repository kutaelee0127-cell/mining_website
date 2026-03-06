export interface ExternalLinkCardProps {
  title: string;
  label: string;
  href: string;
}

export function ExternalLinkCard({ title, label, href }: ExternalLinkCardProps) {
  return (
    <article>
      <h2>{title}</h2>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </article>
  );
}
