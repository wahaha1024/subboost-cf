"use client";

import * as React from "react";

type SafeImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallback: React.ReactNode;
};

export function SafeImage({ src, fallback, onError, alt = "", ...props }: SafeImageProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) return fallback;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={src}
      alt={alt}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
    />
  );
}
