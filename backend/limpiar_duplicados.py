"""
Script para limpiar duplicados en la base de datos
Este script:
1. Elimina usuarios duplicados, manteniendo solo el primero
2. Elimina registros de asistencia duplicados para el mismo usuario y fecha
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener la URL de la base de datos
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL no está configurada en el archivo .env")
    exit(1)

# Crear conexión a la base de datos
engine = create_engine(DATABASE_URL)

def limpiar_usuarios_duplicados():
    """Elimina usuarios duplicados, manteniendo solo el primero de cada nombre"""
    print("\n=== Limpiando usuarios duplicados ===")
    
    with engine.connect() as conn:
        # Encontrar usuarios duplicados
        result = conn.execute(text("""
            SELECT nombre, COUNT(*) as count, MIN(id_usuario) as keep_id
            FROM usuario
            GROUP BY nombre
            HAVING COUNT(*) > 1
        """))
        
        duplicados = result.fetchall()
        
        if not duplicados:
            print("✓ No se encontraron usuarios duplicados")
            return
        
        print(f"Encontrados {len(duplicados)} nombres de usuario duplicados:")
        
        for nombre, count, keep_id in duplicados:
            print(f"\n  - '{nombre}' aparece {count} veces")
            
            # Obtener todos los IDs de este usuario
            ids_result = conn.execute(text("""
                SELECT id_usuario FROM usuario
                WHERE nombre = :nombre
                ORDER BY id_usuario
            """), {"nombre": nombre})
            
            ids = [row[0] for row in ids_result.fetchall()]
            ids_to_delete = [id for id in ids if id != keep_id]
            
            print(f"    Manteniendo ID {keep_id}, eliminando IDs: {ids_to_delete}")
            
            # Primero, eliminar las asistencias asociadas a los usuarios duplicados
            for user_id in ids_to_delete:
                conn.execute(text("""
                    DELETE FROM asistencia WHERE id_usuario = :user_id
                """), {"user_id": user_id})
                print(f"    - Eliminadas asistencias del usuario ID {user_id}")
            
            # Luego, eliminar los usuarios duplicados
            for user_id in ids_to_delete:
                conn.execute(text("""
                    DELETE FROM usuario WHERE id_usuario = :user_id
                """), {"user_id": user_id})
                print(f"    - Eliminado usuario ID {user_id}")
            
            conn.commit()
        
        print("\n✓ Usuarios duplicados eliminados exitosamente")

def limpiar_asistencias_duplicadas():
    """Elimina registros de asistencia duplicados para el mismo usuario y evento"""
    print("\n=== Limpiando registros de asistencia duplicados ===")
    
    with engine.connect() as conn:
        # Encontrar asistencias duplicadas
        # Nota: La tabla asistencia tiene clave primaria compuesta (id_usuario, id_evento)
        # por lo que no debería haber duplicados, pero verificamos de todas formas
        result = conn.execute(text("""
            SELECT id_usuario, id_evento, COUNT(*) as count
            FROM asistencia
            GROUP BY id_usuario, id_evento
            HAVING COUNT(*) > 1
        """))
        
        duplicados = result.fetchall()
        
        if not duplicados:
            print("✓ No se encontraron registros de asistencia duplicados")
            return
        
        print(f"Encontrados {len(duplicados)} registros de asistencia duplicados:")
        
        for id_usuario, id_evento, count in duplicados:
            print(f"\n  - Usuario ID {id_usuario}, Evento ID {id_evento}: {count} registros")
            
            # Obtener información del usuario y fecha
            info = conn.execute(text("""
                SELECT u.nombre, e.fecha
                FROM usuario u, evento e
                WHERE u.id_usuario = :user_id AND e.id_evento = :event_id
            """), {"user_id": id_usuario, "event_id": id_evento}).fetchone()
            
            if info:
                nombre, fecha = info
                print(f"    Usuario: {nombre}, Fecha: {fecha}")
            
            # Como la tabla tiene clave primaria compuesta, esto no debería ocurrir
            # pero si ocurre, necesitamos investigar
            print("    ADVERTENCIA: Esto no debería ocurrir con la clave primaria compuesta")
        
        print("\n✓ Verificación de asistencias completada")

def mostrar_resumen():
    """Muestra un resumen de la base de datos después de la limpieza"""
    print("\n=== Resumen de la base de datos ===")
    
    with engine.connect() as conn:
        # Contar usuarios
        usuarios = conn.execute(text("SELECT COUNT(*) FROM usuario")).scalar()
        print(f"Total de usuarios: {usuarios}")
        
        # Contar eventos
        eventos = conn.execute(text("SELECT COUNT(*) FROM evento")).scalar()
        print(f"Total de eventos: {eventos}")
        
        # Contar asistencias
        asistencias = conn.execute(text("SELECT COUNT(*) FROM asistencia")).scalar()
        print(f"Total de registros de asistencia: {asistencias}")
        
        # Verificar usuarios únicos
        nombres_unicos = conn.execute(text("""
            SELECT COUNT(DISTINCT nombre) FROM usuario
        """)).scalar()
        
        if nombres_unicos == usuarios:
            print("✓ Todos los nombres de usuario son únicos")
        else:
            print(f"⚠ Hay {usuarios - nombres_unicos} nombres duplicados")

if __name__ == "__main__":
    print("=" * 60)
    print("SCRIPT DE LIMPIEZA DE DUPLICADOS")
    print("=" * 60)
    
    try:
        # Limpiar usuarios duplicados
        limpiar_usuarios_duplicados()
        
        # Limpiar asistencias duplicadas
        limpiar_asistencias_duplicadas()
        
        # Mostrar resumen
        mostrar_resumen()
        
        print("\n" + "=" * 60)
        print("✓ LIMPIEZA COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error durante la limpieza: {e}")
        import traceback
        traceback.print_exc()
