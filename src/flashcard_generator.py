import time
import random

def parse_flashcards(raw_input):
    flashcards = []
    lines = raw_input.strip().split("\n")
    for line in lines:
        if ";" in line:
            term, definition = line.split(";", 1)
            flashcards.append((term.strip(), definition.strip()))
    return flashcards

def review_flashcards(flashcards):
    unmemorized = []
    total_time = 0

    for term, definition in flashcards:
        print(f"\n🧠 What is: {term}? (Press enter to reveal or type 'exit')")

        start = time.time()
        user_input = input("> ").strip()
        if user_input.lower() == "exit":
            return None

        print(f"💡 Answer: {definition}")
        response = input("✅ Did you memorize it? (y/n): ").strip().lower()
        elapsed = time.time() - start
        total_time += elapsed

        if response == "exit":
            return None
        elif response != "y":
            unmemorized.append((term, definition))

        print(f"⏱️ Time taken: {elapsed:.2f} sec")
        print("-" * 40)

    return unmemorized, total_time

def main():
    print("📋 Flashcard Session")
    print("Enter flashcards in the format: term; definition")
    print("Type 'done' to start the session\n")

    flashcard_lines = []
    while True:
        line = input()
        if line.strip().lower() == "done":
            break
        flashcard_lines.append(line)

    flashcards = parse_flashcards("\n".join(flashcard_lines))
    if not flashcards:
        print("❌ No valid flashcards entered.")
        return

    random.shuffle(flashcards)

    round_num = 1
    current_deck = flashcards
    session_start = time.time()

    while current_deck:
        print(f"\n🔁 Round {round_num} — {len(current_deck)} card(s)")
        result = review_flashcards(current_deck)
        if result is None:
            print("\n👋 Session ended early.")
            break

        current_deck, round_time = result
        print(f"🕓 Round {round_num} completed in {round_time:.2f} seconds")

        if current_deck:
            print(f"🔁 {len(current_deck)} card(s) not memorized. Reviewing again...\n")
            round_num += 1
        else:
            total_time = time.time() - session_start
            print("\n🎉 All flashcards memorized!")
            print(f"📊 Total session time: {total_time:.2f} seconds")

if __name__ == "__main__":
    main()
