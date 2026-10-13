from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Kusa nitong gagawin ang 'courses' table sa database pagka-start
def init_db():
    conn = get_db_connection()
    conn.execute('''
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

# GET: Kunin ang mga courses
@app.route('/api/courses', methods=['GET'])
def get_courses():
    conn = get_db_connection()
    courses = conn.execute('SELECT * FROM courses').fetchall()
    conn.close()
    return jsonify([dict(c) for c in courses])

# POST: Mag-save ng course
@app.route('/api/courses', methods=['POST'])
def add_course():
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO courses (course_code, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?)',
        (data['course_code'], data['day_of_week'], data['start_time'], data['end_time'], data['room'])
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Course added successfully'}), 201

# DELETE: Magbura ng course
@app.route('/api/courses/<course_code>', methods=['DELETE'])
def delete_course(course_code):
    conn = get_db_connection()
    conn.execute('DELETE FROM courses WHERE course_code = ?', (course_code,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Course deleted successfully'}), 200

if __name__ == '__main__':
    init_db()  # Tawagin ang database setup
    app.run(debug=True, port=5000)