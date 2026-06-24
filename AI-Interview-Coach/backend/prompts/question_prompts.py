"""
Prompt templates used to generate role-specific interview questions via Qwen3.
"""

ROLE_CATEGORY_MAP = {
    "Data Scientist": ["Statistics", "Machine Learning", "Python", "SQL", "Real-world Scenario"],
    "Data Analyst": ["SQL", "Statistics", "Data Visualization", "Excel/BI Tools", "Real-world Scenario"],
    "Machine Learning Engineer": [
        "Machine Learning Theory",
        "Model Deployment",
        "Python",
        "System Design",
        "Real-world Scenario",
    ],
    "AI Engineer": [
        "Deep Learning",
        "LLMs & Prompting",
        "Python",
        "MLOps",
        "Real-world Scenario",
    ],
    "Python Developer": [
        "Core Python",
        "Data Structures & Algorithms",
        "Frameworks",
        "Testing & Debugging",
        "Real-world Scenario",
    ],
    "Java Developer": [
        "Core Java",
        "OOP & Design Patterns",
        "Collections & Concurrency",
        "Spring/Frameworks",
        "Real-world Scenario",
    ],
    "Full Stack Developer": [
        "Frontend Fundamentals",
        "Backend & APIs",
        "Databases",
        "System Design",
        "Real-world Scenario",
    ],
    "Cloud Engineer": [
        "Cloud Architecture",
        "Networking & Security",
        "Infrastructure as Code",
        "Cost & Scaling",
        "Real-world Scenario",
    ],
    "DevOps Engineer": [
        "CI/CD",
        "Containers & Orchestration",
        "Monitoring & Reliability",
        "Infrastructure as Code",
        "Real-world Scenario",
    ],
}

DEFAULT_CATEGORIES = [
    "Core Concepts",
    "Practical Application",
    "Tools & Technology",
    "Problem Solving",
    "Real-world Scenario",
]


def get_categories_for_role(role: str):
    return ROLE_CATEGORY_MAP.get(role, DEFAULT_CATEGORIES)


def build_question_generation_prompt(
    role: str,
    experience: str,
    difficulty: str,
    resume_context: str | None = None,
) -> str:
    categories = get_categories_for_role(role)
    category_lines = "\n".join(f"Question {i + 1}: {cat}" for i, cat in enumerate(categories))

    resume_block = ""
    if resume_context:
        resume_block = f"""
The candidate has also provided a resume. Use the following extracted resume context
to personalize at least 2 of the questions (particularly around their listed projects,
skills, or experience) where relevant to the role:

---
{resume_context[:3000]}
---
"""

    prompt = f"""You are a senior technical interviewer creating an interview question set.

Role: {role}
Candidate Experience Level: {experience}
Interview Difficulty: {difficulty}
{resume_block}
Generate EXACTLY 5 interview questions for this candidate. The questions must cover
these categories, in this exact order:

{category_lines}

Rules:
- Each question must be clear, specific, and appropriate for the stated difficulty and experience level.
- Do not include the category name inside the question text itself.
- Do not number the questions inside the question text.
- Avoid yes/no questions; favor questions that require explanation or reasoning.
- Return ONLY valid JSON, with no markdown formatting, no commentary, and no <think> tags.

Return JSON in EXACTLY this shape:
{{
  "questions": [
    {{"id": 1, "question": "..."}},
    {{"id": 2, "question": "..."}},
    {{"id": 3, "question": "..."}},
    {{"id": 4, "question": "..."}},
    {{"id": 5, "question": "..."}}
  ]
}}
"""
    return prompt.strip()
