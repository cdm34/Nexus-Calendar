# parse_ics.py
# Script to parse .ics calendar files and display event information

from ics import Calendar
import os

def load_calendar(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        calendar = Calendar(f.read())

    print(f"\nLoaded {len(calendar.events)} events from {file_path}:\n")
    for event in calendar.events:
        print("Title:", event.name)
        print("Start:", event.begin)
        print("End:", event.end)
        print("Location:", event.location)
        print("Description:", event.description)
        print("-" * 40)

if __name__ == "__main__":
    # Replace this with your own .ics file name
    file_name = "sample_calendar.ics"
    load_calendar(file_name)
