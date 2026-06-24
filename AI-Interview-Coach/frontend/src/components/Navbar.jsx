import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, BarChart3 } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navLink = (to, label, icon) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-display text-sm font-medium transition-colors ${
          active ? "text-secondary" : "text-muted hover:text-ink"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cardborder/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary"
            whileHover={{ rotate: 8, scale: 1.05 }}
          >
            <Target size={18} className="text-ink" strokeWidth={2.5} />
          </motion.div>
          <span className="font-display text-lg font-bold tracking-tight">
            Interview<span className="text-secondary">Coach</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLink("/", "Home", null)}
          {navLink("/setup", "Practice", <Target size={15} />)}
          {navLink("/analytics", "Analytics", <BarChart3 size={15} />)}
        </nav>
      </div>
    </header>
  );
}
