import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function AnimatedCounter({ value = 0, duration = 1.2, suffix = "", decimals = 0 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value]);

  return (
    <motion.span className="font-display font-bold">
      {display}
      {suffix}
    </motion.span>
  );
}
