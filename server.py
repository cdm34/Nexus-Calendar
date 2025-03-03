from flask import Flask, jsonify, render_template
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__, template_folder="templates")
CORS(app)

# Initialize Firebase Admin SDK for Firestore
cred = credentials.Certificate("/home/bwstk/rpi4-flaskapp/nexus-calendar-7922f-firebase-adminsdk-fbsvc-94deec6503.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()  # Firestore Database Client

@app.route("/")
def index():
    try:
        return render_template("index.html")
    except Exception as e:
        return f"Template Error: {str(e)}"

@app.route('/data')
def get_data():
    try:
        events_ref = db.collection("users").document("57340ff4-6467-47f3-a2a3-cbc532e4119c") \
                       .collection("calendars").document("google").collection("events")
        
        docs = events_ref.stream()
        
        events = []
        for doc in docs:
            event_data = doc.to_dict()
            formatted_event = {
                "id": doc.id,
                "title": event_data.get("title", "No Title"),
                "start_time": event_data.get("start_time", "Unknown Start"),
                "end_time": event_data.get("end_time", "Unknown End"),
                "location": event_data.get("location", "No Location"),
                "description": event_data.get("description", "No Description")
            }
            events.append(formatted_event)

        if not events:
            return jsonify({"error": "No events found"}), 404

        return jsonify(events)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
