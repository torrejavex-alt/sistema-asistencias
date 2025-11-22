"""
Script para verificar las tablas en Neon
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

try:
    print("🔄 Conectando a Neon PostgreSQL...")
    conn = psycopg2.connect(neon_url)
    cursor = conn.cursor()
    
    print("✓ Conectado exitosamente\n")
    
    # Listar todas las tablas
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    
    if tables:
        print("📋 Tablas encontradas en la base de datos:")
        for table in tables:
            print(f"  - {table[0]}")
            
            # Contar registros en cada tabla
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"    ({count} registros)")
    else:
        print("❌ No se encontraron tablas en la base de datos")
        print("⚠️  Necesitas ejecutar init_neon_db.py primero")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
