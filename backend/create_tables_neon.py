"""
Script para crear las tablas en Neon PostgreSQL
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Obtener URL de variable de entorno
neon_url = os.getenv('DATABASE_URL')

if not neon_url:
    print("❌ Error: DATABASE_URL no encontrada en variables de entorno")
    print("Asegúrate de tener un archivo .env con DATABASE_URL definida")
    exit(1)

# SQL para crear tablas
sql_commands = [
    """
    CREATE TABLE IF NOT EXISTS usuario (
        id_usuario SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        instrumento VARCHAR(100)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS evento (
        id_evento SERIAL PRIMARY KEY,
        fecha DATE NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS tipo_asistencia (
        id_tipo SERIAL PRIMARY KEY,
        descripcion VARCHAR(50) UNIQUE NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS asistencia (
        id_usuario INTEGER REFERENCES usuario(id_usuario),
        id_evento INTEGER REFERENCES evento(id_evento),
        id_tipo INTEGER REFERENCES tipo_asistencia(id_tipo),
        PRIMARY KEY (id_usuario, id_evento)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS admin (
        id_admin SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
]

# Datos iniciales para tipo_asistencia
initial_data = [
    "INSERT INTO tipo_asistencia (id_tipo, descripcion) VALUES (1, 'Asistió') ON CONFLICT DO NOTHING;",
    "INSERT INTO tipo_asistencia (id_tipo, descripcion) VALUES (2, 'No asistió') ON CONFLICT DO NOTHING;",
    "INSERT INTO tipo_asistencia (id_tipo, descripcion) VALUES (3, 'Con permiso') ON CONFLICT DO NOTHING;",
    "INSERT INTO tipo_asistencia (id_tipo, descripcion) VALUES (4, 'No convocado') ON CONFLICT DO NOTHING;"
]

try:
    print("🔄 Conectando a Neon PostgreSQL...")
    conn = psycopg2.connect(neon_url)
    cursor = conn.cursor()
    
    print("✓ Conectado exitosamente")
    
    print("🔄 Creando tablas...")
    for command in sql_commands:
        cursor.execute(command)
    
    print("🔄 Insertando datos iniciales...")
    for command in initial_data:
        cursor.execute(command)
        
    conn.commit()
    
    print("\n✅ ¡Tablas creadas exitosamente!")
    print("Ahora puedes conectar tu aplicación usando la misma URL.")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n❌ Error: {e}")
