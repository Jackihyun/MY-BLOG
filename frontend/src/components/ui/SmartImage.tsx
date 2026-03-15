"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface SmartImageProps extends ImageProps {
  containerClassName?: string;
  skeletonClassName?: string;
}

export default function SmartImage({
  alt,
  className,
  containerClassName,
  skeletonClassName,
  onLoad,
  width,
  height,
  fill,
  ...props
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <span
      className={cn("relative block overflow-hidden", containerClassName)}
      style={
        fill || typeof width !== "number" || typeof height !== "number"
          ? undefined
          : { width, height }
      }
    >
      {!isLoaded && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800",
            skeletonClassName
          )}
        />
      )}
      <Image
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        fill={fill}
        width={width}
        height={height}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
        {...props}
      />
    </span>
  );
}
