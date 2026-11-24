import { formatRating } from "@/lib/branches";

/** Five stars, filled up to the rounded rating; the label reads the exact value. */
export default function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="stars" role="img" aria-label={`${formatRating(rating)} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" opacity={i < filled ? 1 : 0.25}>
          <path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.8 21.4l1.5-7.1L1.9 9.4l7.2-.8z" />
        </svg>
      ))}
    </span>
  );
}
