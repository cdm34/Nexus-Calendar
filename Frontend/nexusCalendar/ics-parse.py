# backend.py
from flask import Flask, request, jsonify
from ics import Calendar
import os
import firebase_admin
from firebase_admin import credentials, firestore
import tempfile
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# Initialize Firebase
cred = credentials.Certificate('../../firebase-keys.json')
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
    for extra in calendar.extra:
        if extra.name.upper() == "PRODID":
            prodid = extra.value.strip().lower()
            if "icloud" in prodid:
                return "iCloud"
            elif "outlook" in prodid or "microsoft":
                return "Outlook"
            elif "google" in prodid:
                return "Google"
            return f"ICS ({prodid})"
    return "ICS"

@app.route('/import-ics', methods=['POST'])
def import_ics():
    if 'file' not in request.files or 'nexusUserId' not in request.form:
        return jsonify({'error': 'Missing file or user ID'}), 400

    file = request.files['file']
    nexus_user_id = request.form['nexusUserId']

    with tempfile.NamedTemporaryFile(delete=False, suffix=".ics") as temp_file:
        file.save(temp_file.name)
        with open(temp_file.name, 'r', encoding='utf-8') as f:
            calendar = Calendar(f.read())
        provider = detect_provider(calendar)

        for event in calendar.events:
            store_event_to_firestore(nexus_user_id, event, provider)

    return jsonify(message='ICS file imported successfully')

if __name__ == '__main__':
    app.run(port=4001)
