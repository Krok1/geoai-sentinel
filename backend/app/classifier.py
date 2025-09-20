# backend/app/classifier.py
KEYWORDS = {
    "fire": ["fire", "пожеж", "пожежа", "горить", "горіння", "палає", "🔥"],
    "drought": ["drought", "посуха", "засуха"],
    "construction": ["build", "будів", "будується", "construction", "зведення"],
    "deforestation": ["cut", "вирубк", "вирубка", "deforest"],
    "flood": ["flood", "повінь", "паводок"],
}

def classify_text(text: str):
    text_l = text.lower()
    for label, keys in KEYWORDS.items():
        for k in keys:
            if k in text_l:
                return {"label": label, "score": 0.9}
    return {"label": "other", "score": 0.5}
