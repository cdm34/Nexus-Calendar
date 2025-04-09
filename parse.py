# parse.py
from ics import Calendar
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./nexus-calendar-7922f-firebase-adminsdk-fbsvc-94deec6503.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def store_event_to_firestore(nexus_user_id, event, provider):
    event_ref = db.collection(f'users/{nexus_user_id}/calendars/{provider}/events').document()
    event_ref.set({
        'title': event.name,
        'startTime': event.begin.isoformat() if event.begin else "",
        'endTime': event.end.isoformat() if event.end else "",
        'location': event.location or "",
        'description': event.description or ""
    })
    
def detect_provider(calendar: Calendar) -> str:
    prodid = ""

    for extra in calendar.extra:
        if extra.name.upper() == "PRODID":
            prodid = extra.value.strip().lower()
            break

    if "icloud" in prodid or "caldav.icloud.com" in prodid:
        return "iCloud"
    elif "microsoft exchange" in prodid or "outlook" in prodid:
        return "Outlook"
    elif "google" in prodid:
        return "Google"
    elif prodid:
        return f"Unknown ({prodid})"
    else:
        return "Unknown"


def load_calendar(file_path, nexus_user_id):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        calendar = Calendar(f.read())

    provider = detect_provider(calendar)
    print(f"\nLoaded {len(calendar.events)} events from {file_path}")

    for event in calendar.events:
        print("Title:", event.name)
        print("Start:", event.begin)
        print("End:", event.end)
        print("Location:", event.location)
        print("Description:", event.description)
        print("-" * 40)

        store_event_to_firestore(nexus_user_id, event, provider)


if __name__ == "__main__":
    file_name = "Public Calendar.ics"
    nexus_user_id = "56e63dc8-3a84-4910-9737-9750d9325cb5"  # Replace with actual Nexus user ID
    load_calendar(file_name, nexus_user_id)
