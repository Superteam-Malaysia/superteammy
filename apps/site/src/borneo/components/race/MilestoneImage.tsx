type MilestoneImageProps = {
  src: string;
  className?: string;
  /** Hero images load eagerly; list thumbnails lazy-load. */
  priority?: boolean;
};

/** Plain img — avoids next/image optimizer rejecting ?query cache-busters on public files. */
export function MilestoneImage({ src, className, priority = false }: MilestoneImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
