"""
Prompt templates used to evaluate a candidate's interview answer via Qwen3.
"""


def build_evaluation_prompt(role: str, question: str, candidate_answer: str) -> str:
    if not candidate_answer or not candidate_answer.strip():
        candidate_answer = "(The candidate skipped this question and provided no answer.)"

    prompt = f"""You are a senior technical interviewer for the role of {role}.

Evaluate the candidate's answer to the following interview question.

Question:
{question}

Candidate Answer:
{candidate_answer}

Evaluation Criteria (each scored out of 10):
1. Technical Accuracy
2. Depth of Knowledge
3. Communication Clarity
4. Problem Solving Ability

Instructions:
- Score each criterion from 0 to 10 (integers).
- overall_score is the sum of the four scores converted to a percentage out of 100
  (i.e. sum of the 4 scores * 2.5, rounded to the nearest integer).
- If the candidate provided no answer or skipped, all scores should be low (0-2) and
  feedback should clearly state no answer was given.
- strengths, weaknesses, and improvements must each be a list of short, specific bullet points (1-4 items each).
- ideal_answer should be a concise model answer (3-6 sentences) a strong candidate would give.
- Return ONLY valid JSON, with no markdown formatting, no commentary, and no <think> tags.

Return JSON in EXACTLY this shape:
{{
  "technical_score": 8,
  "depth_score": 7,
  "clarity_score": 9,
  "problem_solving_score": 8,
  "overall_score": 80,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."],
  "ideal_answer": "..."
}}
"""
    return prompt.strip()
