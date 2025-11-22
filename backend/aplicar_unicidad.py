"""
Script para aplicar la restricción de unicidad al campo nombre en la tabla usuario
Este script debe ejecutarse DESPUÉS de limpiar_duplicados.py
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

def aplicar_restriccion_unicidad():
    """Aplica la restricción UNIQUE al campo nombre de la tabla usuario"""
    print("\n=== Aplicando restricción de unicidad ===")
    
    with engine.connect() as conn:
        try:
            # Verificar si ya existe la restricción
            result = conn.execute(text("""
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE table_name = 'usuario'
                AND constraint_type = 'UNIQUE'
                AND constraint_name LIKE '%nombre%'
            """))
            
            existing = result.fetchone()
            
            if existing:
                print(f"✓ La restricción de unicidad ya existe: {existing[0]}")
                return
            
            # Aplicar la restricción UNIQUE
            print("Aplicando restricción UNIQUE al campo nombre...")
            conn.execute(text("""
                ALTER TABLE usuario
                ADD CONSTRAINT usuario_nombre_unique UNIQUE (nombre)
            """))
            conn.commit()
            
            print("✓ Restricción de unicidad aplicada exitosamente")
            
        except Exception as e:
            print(f"✗ Error al aplicar la restricción: {e}")
            conn.rollback()
            raise

def verificar_restriccion():
    """Verifica que la restricción se haya aplicado correctamente"""
    print("\n=== Verificando restricción ===")
    
    with engine.connect() as conn:
        # Listar todas las restricciones de la tabla usuario
        result = conn.execute(text("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'usuario'
            ORDER BY constraint_type, constraint_name
        """))
        
        constraints = result.fetchall()
        
        print("Restricciones en la tabla usuario:")
        for name, type in constraints:
            print(f"  - {name} ({type})")
        
        # Verificar específicamente la restricción de unicidad en nombre
        unique_constraint = any(
            'nombre' in name.lower() and type == 'UNIQUE'
            for name, type in constraints
        )
        
        if unique_constraint:
            print("\n✓ La restricción de unicidad en 'nombre' está activa")
        else:
            print("\n⚠ No se encontró la restricción de unicidad en 'nombre'")

if __name__ == "__main__":
    print("=" * 60)
    print("APLICAR RESTRICCIÓN DE UNICIDAD")
    print("=" * 60)
    print("\nIMPORTANTE: Ejecuta primero 'limpiar_duplicados.py'")
    print("para eliminar duplicados existentes.\n")
    
    respuesta = input("¿Deseas continuar? (s/n): ")
    
    if respuesta.lower() != 's':
        print("Operación cancelada")
        exit(0)
    
    try:
        # Aplicar restricción
        aplicar_restriccion_unicidad()
        
        # Verificar
        verificar_restriccion()
        
        print("\n" + "=" * 60)
        print("✓ PROCESO COMPLETADO EXITOSAMENTE")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error durante el proceso: {e}")
        import traceback
        traceback.print_exc()
