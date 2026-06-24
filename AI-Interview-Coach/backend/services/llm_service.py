"""
Client for talking to the locally-hosted Qwen3 model via Ollama's /api/generate endpoint.

This service NEVER talks to any external/cloud LLM API. It only talks to the
local Ollama server, keeping the project strictly on open-source models.
"""
import json
import re
from typing import Any, Dict

import httpx

from config import get_settings

settings = get_settings()


class LLMServiceError(Exception):
    """Raised when the LLM call fails or returns an unparsable response."""


def _strip_think_tags(text: str) -> str:
    """Qwen3 sometimes emits <think>...</think> reasoning blocks; remove them."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def _extract_json(text: str) -> Dict[str, Any]:
    """
    Extract the first valid JSON object from a block of text.
    Handles cases where the model wraps JSON in markdown fences or adds extra prose.
    """
    cleaned = _strip_think_tags(text)

    # Remove markdown code fences if present
    cleaned = re.sub(r"^```(?:json)?", "", cleaned.strip())
    cleaned = re.sub(r"```$", "", cleaned.strip())
    cleaned = cleaned.strip()

    # Try direct parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fall back to locating the first {...} block via brace matching
    start = cleaned.find("{")
    if start == -1:
        raise LLMServiceError(f"No JSON object found in LLM response: {text[:500]}")

    depth = 0
    for i in range(start, len(cleaned)):
        if cleaned[i] == "{":
            depth += 1
        elif cleaned[i] == "}":
            depth -= 1
            if depth == 0:
                candidate = cleaned[start : i + 1]
                try:
                    return json.loads(candidate)
                except json.JSONDecodeError as exc:
                    raise LLMServiceError(f"Failed to parse extracted JSON: {exc}\nRaw: {candidate[:500]}")

    raise LLMServiceError(f"Unbalanced JSON braces in LLM response: {text[:500]}")


async def generate_json(prompt: str, temperature: float = 0.4) -> Dict[str, Any]:
    """
    Send a prompt to the local Qwen3 model via Ollama and parse the JSON response.
    """
    url = f"{settings.ollama_base_url}/api/generate"
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": temperature,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=settings.ollama_timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        raise LLMServiceError(
            f"Could not reach Ollama at {url}. Is Ollama running with the "
            f"'{settings.ollama_model}' model pulled? Original error: {exc}"
        )

    raw_text = data.get("response", "")
    if not raw_text:
        raise LLMServiceError(f"Empty response from Ollama: {data}")

    return _extract_json(raw_text)


async def check_ollama_health() -> bool:
    """Quick health check used by the /health endpoint."""
    url = f"{settings.ollama_base_url}/api/tags"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(url)
            return response.status_code == 200
    except httpx.HTTPError:
        return False
