import { motion } from "framer-motion";

const READINESS_COLORS = {
  Excellent: "#22C55E",
  Ready: "#06B6D4",
  "Needs Improvement": "#F59E0B",
  Beginner: "#EF4444",
};

function colorForScore(score) {
  if (score >= 90) return READINESS_COLORS.Excellent;
  if (score >= 75) return READINESS_COLORS.Ready;
  if (score >= 60) return READINESS_COLORS["Needs Improvement"];
  return READINESS_COLORS.Beginner;
}

/**
 * ReadinessRing — the product's signature visual element.
 * A circular progress meter representing "how close to interview-ready" a score is.
 * Reused at three moments: hero (decorative, static demo value), interview progress,
 * and the final results dashboard (animated reveal).
 */
export default function ReadinessRing({
  score = 0,
  size = 200,
  strokeWidth = 14,
  label,
  sublabel,
  animate = true,
  color,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const ringColor = color || colorForScore(clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A3B52"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animate ? offset : offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${ringColor}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-bold text-ink"
          style={{ fontSize: size * 0.22 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {Math.round(clamped)}
          <span className="text-muted" style={{ fontSize: size * 0.12 }}>
            %
          </span>
        </motion.span>
        {label && (
          <span className="font-mono text-xs uppercase tracking-wide text-muted" style={{ marginTop: 2 }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className="mt-1 font-display text-sm font-semibold" style={{ color: ringColor }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

export { colorForScore };
