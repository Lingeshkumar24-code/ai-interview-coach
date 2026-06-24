"""
Small shared utility helpers.
"""
from typing import Any, Dict


def safe_round(value: Any, digits: int = 2) -> float:
    try:
        return round(float(value), digits)
    except (TypeError, ValueError):
        return 0.0


def readiness_color(label: str) -> str:
    """Maps a readiness label to a UI color hex, kept in sync with the frontend theme."""
    mapping = {
        "Excellent": "#22C55E",
        "Ready": "#06B6D4",
        "Needs Improvement": "#F59E0B",
        "Beginner": "#EF4444",
    }
    return mapping.get(label, "#94A3B8")
