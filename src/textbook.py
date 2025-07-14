import fitz  # PyMuPDF
import os
import nltk
import random
import sys
import json
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk import pos_tag
from string import punctuation
from collections import defaultdict

# 📦 Download NLTK resources
nltk.download("punkt")
nltk.download("stopwords")
nltk.download("averaged_perceptron_tagger")

# ------------------------- Load PDF -------------------------
def load_pdf_text(pdf_path):
    if not os.path.exists(pdf_path):
        return None

    try:
        doc = fitz.open(pdf_path)
        pages = [(i + 1, page.get_text()) for i, page in enumerate(doc)]
        doc.close()
        return pages
    except Exception as e:
        return None

# ------------------------- Search -------------------------
def search_term_in_pages(pages, term):
    matches = []
    term_lower = term.lower()
    for page_num, text in pages:
        if term_lower in text.lower():
            index = text.lower().find(term_lower)
            preview = text[max(0, index-50): index+len(term)+50].replace('\n', ' ')
            matches.append((page_num, text, preview.strip()))
    return matches

# ------------------------- Quiz Generator -------------------------
def create_cloze_quiz(text, term):
    sentences = sent_tokenize(text)
    if not sentences:
        return []

    selected = random.sample(sentences, min(3, len(sentences)))
    quiz = []

    for sent in selected:
        words = word_tokenize(sent)
        tagged = pos_tag(words)
        blanks = [word for word, tag in tagged if word.lower() == term.lower() or tag in ("NN", "NNS", "JJ")]
        if not blanks:
            continue

        word_to_blank = random.choice(blanks)
        cloze = sent.replace(word_to_blank, "_____")
        quiz.append({ "question": cloze, "answer": word_to_blank })

    return quiz

# ------------------------- Entry Point for API -------------------------
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Expected PDF path and search term"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    term = sys.argv[2]

    pages = load_pdf_text(pdf_path)
    if not pages:
        print(json.dumps({"error": "Could not read PDF"}))
        sys.exit(1)

    matches = search_term_in_pages(pages, term)
    if not matches:
        print(json.dumps([]))
        sys.exit(0)

    _, full_text, _ = matches[0]
    quiz = create_cloze_quiz(full_text, term)
    print(json.dumps(quiz))
