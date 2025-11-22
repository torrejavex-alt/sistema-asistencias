"""
Script para crear tablas en Neon PostgreSQL usando SQL directo
"""
import psycopg2

neon_url = "postgresql://neondb_owner:npg_mULy0K5sORZX@ep-damp-sunset-ah0baza5-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

try:
    print("🔄 Conectando a Neon PostgreSQL...")
    conn = psycopg2.connect(neon_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("✓ Conectado exitosamente\n")
    
    # Crear tabla usuario
    print("📋 Creando tabla 'usuario'...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            instrumento VARCHAR(100)
        );
    """)
    print("✓ Tabla 'usuario' creada")
    
    # Crear tabla evento
    print("📋 Creando tabla 'evento'...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evento (
            id_evento SERIAL PRIMARY KEY,
            fecha DATE NOT NULL
        );
    """)
    print("✓ Tabla 'evento' creada")
    
    # Crear tabla tipo_asistencia
    print("📋 Creando tabla 'tipo_asistencia'...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tipo_asistencia (
            id_tipo INTEGER PRIMARY KEY,
            descripcion VARCHAR(50) UNIQUE NOT NULL
        );
    """)
    print("✓ Tabla 'tipo_asistencia' creada")
    
    # Insertar tipos de asistencia
    print("📋 Insertando tipos de asistencia...")
    cursor.execute("""
        INSERT INTO tipo_asistencia (id_tipo, descripcion) 
        VALUES 
            (1, 'Asistió'),
            (2, 'No asistió'),
            (3, 'Con permiso'),
            (4, 'No convocado')
        ON CONFLICT (id_tipo) DO NOTHING;
    """)
    print("✓ Tipos de asistencia insertados")
    
    # Crear tabla asistencia
    print("📋 Creando tabla 'asistencia'...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS asistencia (
            id_usuario INTEGER REFERENCES usuario(id_usuario),
            id_evento INTEGER REFERENCES evento(id_evento),
            id_tipo INTEGER REFERENCES tipo_asistencia(id_tipo) NOT NULL,
            PRIMARY KEY (id_usuario, id_evento)
        );
    """)
    print("✓ Tabla 'asistencia' creada")
    
    # Verificar tablas creadas
    print("\n📊 Verificando tablas...")
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    print(f"\n✅ {len(tables)} tablas creadas exitosamente:")
    for table in tables:
        print(f"  - {table[0]}")
    
    cursor.close()
    conn.close()
    
    print("\n🎉 ¡Base de datos inicializada correctamente!")
    print("🚀 Ahora Render podrá conectarse y usar las tablas")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
