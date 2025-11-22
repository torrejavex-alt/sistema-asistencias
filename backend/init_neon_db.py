"""
Script para inicializar la base de datos en Neon PostgreSQL
Ejecutar: python init_neon_db.py
"""
import os
from app import create_app
from extensions import db
from models import Usuario, Evento, Asistencia, TipoAsistencia

# Obtener la URL de la base de datos de Neon
neon_url = input("Pega aquí la DATABASE_URL de Neon (postgresql://...): ").strip()

if not neon_url.startswith('postgresql://'):
    print("❌ Error: La URL debe empezar con 'postgresql://'")
    exit(1)

# Configurar temporalmente la variable de entorno
os.environ['DATABASE_URL'] = neon_url

app = create_app()

with app.app_context():
    print("🔄 Creando tablas en Neon PostgreSQL...")
    
    # Crear todas las tablas
    db.create_all()
    print("✓ Tablas creadas")
    
    # Verificar si ya existen tipos de asistencia
    if TipoAsistencia.query.count() == 0:
        print("🔄 Insertando tipos de asistencia...")
        # Insertar tipos de asistencia predefinidos
        tipos = [
            TipoAsistencia(id_tipo=1, descripcion='Asistió'),
            TipoAsistencia(id_tipo=2, descripcion='No asistió'),
            TipoAsistencia(id_tipo=3, descripcion='Con permiso'),
            TipoAsistencia(id_tipo=4, descripcion='No convocado')
        ]
        for tipo in tipos:
            db.session.add(tipo)
        db.session.commit()
        print("✓ Tipos de asistencia creados")
    else:
        print("✓ Tipos de asistencia ya existen")
    
    print("\n✅ Base de datos Neon inicializada correctamente!")
    print("🚀 Ahora puedes usar tu aplicación en producción")
