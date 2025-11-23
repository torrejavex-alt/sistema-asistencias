
import sqlite3
import os

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "asistencias.db")

print(f"Checking DB at: {db_path}")

if not os.path.exists(db_path):
    print("DB file does not exist!")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT count(*) FROM usuario")
    user_count = cursor.fetchone()[0]
    print(f"Users count: {user_count}")
    
    cursor.execute("SELECT * FROM usuario LIMIT 5")
    users = cursor.fetchall()
    print("First 5 users:", users)
    
    cursor.execute("SELECT count(*) FROM evento")
    event_count = cursor.fetchone()[0]
    print(f"Events count: {event_count}")
    
    cursor.execute("SELECT * FROM evento LIMIT 5")
    events = cursor.fetchall()
    print("First 5 events:", events)

    conn.close()
except Exception as e:
    print(f"Error: {e}")
