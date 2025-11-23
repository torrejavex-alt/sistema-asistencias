
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
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables found:", tables)
    
    cursor.execute("SELECT * FROM admin")
    admins = cursor.fetchall()
    print("Admins found:", admins)
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
