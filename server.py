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


#print("Firestore initialized:", firebase_admin.get_app().name)


@app.route('/data')
def get_data():
    try:
        # Navigate Firestore collections/documents
        events_ref = db.collection("users").document("57340ff4-6467-47f3-a2a3-cbc532e4119c") \
                       .collection("calendars").document("google").collection("events")
        
        docs = events_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}  # Convert documents to JSON-friendly format

        #print("Fetched Data from Firestore:", data)  # Debugging print
        
        if not data:
            return jsonify({"error": "No data found at the specified path"}), 404
        
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/debug_firebase')
def debug_firebase():
    try:
        users_ref = db.collection("users")
        users_docs = users_ref.stream()
        
        data = {doc.id: doc.to_dict() for doc in users_docs}  # Fetch all users
        
        print("Full Firestore Dump:", data)  # Debugging print
        
        return jsonify(data if data else {"error": "Firestore appears empty"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
