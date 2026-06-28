import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
}

const starFullClass = "fill-[var(--color-gold)] text-[var(--color-gold)]";
const starEmptyClass = "text-[#EDEDED] dark:text-white/20";

const SingleStar = ({ size, className }: { size: number; className: string }) => (
  <Star size={size} strokeWidth={1.5} className={className} />
);

const HalfStar = ({ size, fillPercent }: { size: number; fillPercent: number }) => (
  <span className="relative inline-block" style={{ width: size, height: size, lineHeight: 0 }}>
    <span className="absolute inset-0">
      <SingleStar size={size} className={starEmptyClass} />
    </span>
    <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
      <SingleStar size={size} className={starFullClass} />
    </span>
  </span>
);

export const RatingStars = ({ rating, size = 14, className = "" }: RatingStarsProps) => {
  const full = Math.floor(rating);
  const decimal = rating - full;
  const hasHalf = decimal >= 0.25;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const fillPercent = Math.min(decimal * 100, 100);

  return (
    <span className={`inline-flex gap-0.5 items-center ${className}`}>
      {Array.from({ length: full }).map((_, i) => (
        <SingleStar key={`full-${i}`} size={size} className={starFullClass} />
      ))}
      {hasHalf && <HalfStar key="half" size={size} fillPercent={fillPercent} />}
      {Array.from({ length: empty }).map((_, i) => (
        <SingleStar key={`empty-${i}`} size={size} className={starEmptyClass} />
      ))}
    </span>
  );
};
