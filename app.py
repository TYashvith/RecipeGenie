import os
import json
import re
import requests
from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

load_dotenv()

app = Flask(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

print("Gemini key loaded:", bool(GEMINI_API_KEY))
print("Groq key loaded:", bool(GROQ_API_KEY))

PAGE_SIZE = 5

gemini_client = genai.Client(api_key=GEMINI_API_KEY)

with open("recipes.json", "r", encoding="utf-8") as f:
    recipes: List[Dict[str, Any]] = json.load(f)


def build_prompt(user_input: str) -> str:
    return f"""
You are a helpful recipe assistant. The user has these ingredients: {user_input}

Suggest 2 simple recipes they can make.

Respond ONLY with a valid JSON array.
No markdown, no code fences, no explanation.

Use exactly this format:

[
  {{
    "name": "Recipe Name",
    "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
    "time": "15 min",
    "steps": [
      "Step instruction 1",
      "Step instruction 2",
      "Step instruction 3"
    ]
  }},
  {{
    "name": "Recipe Name 2",
    "ingredients": ["ingredient1", "ingredient2"],
    "time": "10 min",
    "steps": [
      "Step instruction 1",
      "Step instruction 2"
    ]
  }}
]

Rules:
- Only use the ingredients the user mentioned plus basic pantry staples (salt, oil, water, pepper).
- Keep recipes beginner-friendly and realistic.
- Make the steps specific to the dish, not generic cooking advice.
- Each recipe should have 4 to 7 clear cooking steps.
- Return raw JSON only.
"""


def normalize_steps(steps_value):
    if isinstance(steps_value, list):
        cleaned = []
        for step in steps_value:
            if isinstance(step, str):
                s = step.strip()
                if s:
                    cleaned.append(s)
        return cleaned

    if isinstance(steps_value, str):
        raw = steps_value.strip()
        if not raw:
            return []

        parts = re.split(r'(?:\n+|(?=Step\s*\d+\.?)|(?<=\.)\s+(?=[A-Z]))', raw)
        cleaned = []
        for part in parts:
            part = re.sub(r'^Step\s*\d+\.?\s*', '', part.strip(), flags=re.I)
            if part:
                cleaned.append(part)
        return cleaned

    return []


def parse_ai_response(raw: str):
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if match:
        raw = match.group(0)

    data = json.loads(raw)

    if not isinstance(data, list):
        raise ValueError("AI response is not a JSON array")

    cleaned = []
    for item in data:
        if isinstance(item, dict):
            cleaned.append({
                "name": item.get("name", "Untitled Recipe"),
                "ingredients": item.get("ingredients", []),
                "time": item.get("time", "10 min"),
                "steps": normalize_steps(item.get("steps", []))
            })

    return cleaned


def normalize_text(text: str) -> str:
    return text.strip().lower()


def tokenize_user_input(user_input: str) -> List[str]:
    parts = re.split(r"[,\n]+|\s{2,}", user_input.lower())
    cleaned_parts = []

    for part in parts:
        piece = part.strip()
        if piece:
            cleaned_parts.append(piece)

    if len(cleaned_parts) == 1:
        cleaned_parts = [p.strip() for p in re.split(r"\s+", user_input.lower()) if p.strip()]

    return list(dict.fromkeys(cleaned_parts))


def ingredient_matches(user_term: str, recipe_ingredient: str) -> bool:
    user_term = normalize_text(user_term)
    recipe_ingredient = normalize_text(recipe_ingredient)

    if not user_term or not recipe_ingredient:
        return False

    if user_term == recipe_ingredient:
        return True

    if user_term in recipe_ingredient:
        return True

    if recipe_ingredient in user_term:
        return True

    user_words = set(re.findall(r"\w+", user_term))
    ingredient_words = set(re.findall(r"\w+", recipe_ingredient))

    if user_words and ingredient_words and user_words.intersection(ingredient_words):
        return True

    return False


def score_recipe(recipe: Dict[str, Any], user_terms: List[str]) -> Optional[Dict[str, Any]]:
    recipe_ingredients = [
        normalize_text(ing)
        for ing in recipe.get("ingredients", [])
        if isinstance(ing, str) and ing.strip()
    ]

    if not recipe_ingredients:
        return None

    matched_ingredients = []
    matched_terms = set()

    for recipe_ing in recipe_ingredients:
        for term in user_terms:
            if ingredient_matches(term, recipe_ing):
                matched_ingredients.append(recipe_ing)
                matched_terms.add(term)
                break

    matched_ingredients = list(dict.fromkeys(matched_ingredients))
    matched_count = len(matched_ingredients)

    if matched_count == 0:
        return None

    ingredient_count = len(recipe_ingredients)
    coverage = matched_count / ingredient_count
    term_coverage = len(matched_terms) / max(len(user_terms), 1)

    exact_bonus = 0.0
    if matched_count >= 2:
        exact_bonus += 0.35
    if coverage >= 0.6:
        exact_bonus += 0.25
    if term_coverage >= 0.6:
        exact_bonus += 0.25

    score = (matched_count * 2.0) + coverage + term_coverage + exact_bonus

    return {
        "recipe": recipe,
        "score": score,
        "matched_count": matched_count,
        "coverage": coverage,
        "term_coverage": term_coverage,
        "ingredient_count": ingredient_count
    }


def find_local_recipes(user_input: str) -> List[Dict[str, Any]]:
    user_terms = tokenize_user_input(user_input)
    ranked_results = []
    seen_names = set()

    for recipe in recipes:
        recipe_name = normalize_text(recipe.get("name", ""))
        if not recipe_name or recipe_name in seen_names:
            continue

        scored = score_recipe(recipe, user_terms)
        if scored:
            ranked_results.append(scored)
            seen_names.add(recipe_name)

    ranked_results.sort(
        key=lambda item: (
            -item["score"],
            -item["matched_count"],
            -item["coverage"],
            -item["term_coverage"],
            item["ingredient_count"],
            item["recipe"]["name"].lower()
        )
    )

    return [item["recipe"] for item in ranked_results]


def try_gemini(prompt: str):
    models = ["gemini-1.5-flash", "gemini-1.5-flash-8b"]

    for model_name in models:
        try:
            print(f"[Gemini] Trying {model_name}...")
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt
            )

            raw = (response.text or "").strip()
            print(f"[Gemini] Raw response:\n{raw}\n")

            parsed = parse_ai_response(raw)
            if parsed:
                return parsed

        except Exception as e:
            print(f"[Gemini] {model_name} failed: {e}")

    return None


def try_groq(prompt: str):
    models = ["llama-3.3-70b-versatile", "llama3-8b-8192"]

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    for model_name in models:
        try:
            print(f"[Groq] Trying {model_name}...")

            payload = {
                "model": model_name,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 900
            }

            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=20
            )

            print(f"[Groq] HTTP {resp.status_code}")
            print(f"[Groq] Response body: {resp.text}")

            resp.raise_for_status()

            raw = resp.json()["choices"][0]["message"]["content"].strip()
            print(f"[Groq] Raw response:\n{raw}\n")

            parsed = parse_ai_response(raw)
            if parsed:
                return parsed

        except Exception as e:
            print(f"[Groq] {model_name} failed: {e}")

    return None


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_input = data.get("message", "").strip().lower()
    offset = int(data.get("offset", 0))

    if not user_input:
        return jsonify({"response": "Please enter some ingredients."}), 400

    matched_recipes = find_local_recipes(user_input)

    if matched_recipes:
        paginated = matched_recipes[offset: offset + PAGE_SIZE]
        has_more = (offset + PAGE_SIZE) < len(matched_recipes)

        return jsonify({
            "source": "local",
            "recipes": paginated,
            "total": len(matched_recipes),
            "offset": offset,
            "next_offset": offset + PAGE_SIZE,
            "has_more": has_more
        })

    print(f"\n[AI Fallback] No strong local match for: {user_input}")
    prompt = build_prompt(user_input)

    ai_recipes = try_gemini(prompt)
    if not ai_recipes:
        ai_recipes = try_groq(prompt)

    if ai_recipes:
        for recipe in ai_recipes:
            recipe["ai_generated"] = True

        return jsonify({
            "source": "ai",
            "recipes": ai_recipes,
            "has_more": False,
            "next_offset": 0
        })

    return jsonify({
        "response": "All AI providers are currently unavailable. Please try again in a moment!"
    }), 503


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)