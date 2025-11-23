"""
Script para eliminar todos los registros de asistencia de la base de datos.
Ejecutar con: python delete_all_asistencias.py
"""

import os
import sys
from sqlalchemy import create_engine, text

# Obtener la URL de la base de datos desde las variables de entorno
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL no está configurada")
    print("Por favor, configura la variable de entorno DATABASE_URL")
    sys.exit(1)

# Crear conexión a la base de datos
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        # Eliminar todos los registros de asistencia
        result = conn.execute(text("DELETE FROM asistencia"))
        conn.commit()
        
        print(f"✅ Se eliminaron {result.rowcount} registros de asistencia")
        print("✅ Base de datos limpiada exitosamente")
        
except Exception as e:
    print(f"❌ Error al eliminar registros: {e}")
    sys.exit(1)
