"use client";

import { useCallback, useEffect, useState } from "react";

type TeamPitchSlideshowProps = {
  slides: string[];
  teamName: string;
};

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TeamPitchSlideshow({ slides, teamName }: TeamPitchSlideshowProps) {
  const total = slides.length;
  const [index, setIndex] = useState(0);

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % total);
  }, [total]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  if (total === 0) return null;

  const src = slides[index];

  return (
    <div className="team-detail__slideshow">
      <div className="team-detail__slideshow-stage">
        <button
          type="button"
          className="team-detail__slideshow-btn team-detail__slideshow-btn--prev"
          onClick={goPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft />
        </button>

        <figure className="team-detail__slideshow-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${teamName} pitch deck slide ${index + 1} of ${total}`}
            className="team-detail__slideshow-img"
            width={1920}
            height={1080}
            draggable={false}
          />
        </figure>

        <button
          type="button"
          className="team-detail__slideshow-btn team-detail__slideshow-btn--next"
          onClick={goNext}
          aria-label="Next slide"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="team-detail__slideshow-footer">
        <p className="team-detail__slideshow-counter">
          Slide {index + 1} <span aria-hidden="true">/</span> {total}
        </p>
        {total <= 14 ? (
          <div className="team-detail__slideshow-dots" role="tablist" aria-label="Pitch slides">
            {slides.map((slideSrc, dotIndex) => (
              <button
                key={slideSrc}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`Go to slide ${dotIndex + 1}`}
                className={`team-detail__slideshow-dot${dotIndex === index ? " team-detail__slideshow-dot--active" : ""}`}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
