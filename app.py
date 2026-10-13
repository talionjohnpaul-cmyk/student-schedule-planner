from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_NAME = "database.db"

def get_db_connection():
    try:
        conn = sqlite3.connect(DB_NAME)
        return conn
    except Exception as e:
        print(f"Database Connection Error: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_code TEXT NOT NULL,
                day_of_week TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                room TEXT NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

# Initialize DB on load
init_db()

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "Backend is running!"}), 200

@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify([]), 200
        cursor = conn.cursor()
        cursor.execute("SELECT course_code, day_of_week, start_time, end_time, room FROM courses")
        rows = cursor.fetchall()
        conn.close()

        courses = []
        for row in rows:
            courses.append({
                "course_code": row[0],
                "day_of_week": row[1],
                "start_time": row[2],
                "end_time": row[3],
                "room": row[4]
            })
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/courses', methods=['POST'])
def add_course():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data"}), 400

        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO courses (course_code, day_of_week, start_time, end_time, room)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data.get('course_code', ''),
                data.get('day_of_week', ''),
                data.get('start_time', ''),
                data.get('end_time', ''),
                data.get('room', '')
            ))
            conn.commit()
            conn.close()

        return jsonify({"message": "Course added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/courses/<course_code>', methods=['DELETE'])
def delete_course(course_code):
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM courses WHERE course_code = ?", (course_code,))
            conn.commit()
            conn.close()

        return jsonify({"message": "Course deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
