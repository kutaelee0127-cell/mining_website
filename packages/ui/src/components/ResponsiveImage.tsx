export interface ResponsiveImageProps {
  alt: string;
  baseUrl: string;
}

export function ResponsiveImage({ alt, baseUrl }: ResponsiveImageProps) {
  return (
    <img
      alt={alt}
      loading="lazy"
      src={`${baseUrl}?w=640`}
      srcSet={`${baseUrl}?w=320 320w, ${baseUrl}?w=640 640w, ${baseUrl}?w=1024 1024w`}
      sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}
