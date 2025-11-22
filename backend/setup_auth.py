"""
Script para crear la tabla de administradores y el primer usuario admin
"""

import os
from sqlalchemy import create_engine, text
import bcrypt as bcrypt_lib
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

def crear_tabla_admin():
    """Crea la tabla admin si no existe"""
    print("\n=== Creando tabla de administradores ===")
    
    with engine.connect() as conn:
        try:
            # Crear tabla admin
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS admin (
                    id_admin SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    nombre_completo VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✓ Tabla 'admin' creada exitosamente")
            
        except Exception as e:
            print(f"✗ Error al crear la tabla: {e}")
            conn.rollback()
            raise

def crear_admin_inicial():
    """Crea el primer usuario administrador"""
    print("\n=== Creando usuario administrador inicial ===")
    
    # Solicitar datos del administrador
    print("\nIngresa los datos del primer administrador:")
    username = input("Usuario (ej: admin): ").strip()
    
    if not username:
        print("✗ El nombre de usuario no puede estar vacío")
        return
    
    password = input("Contraseña: ").strip()
    
    if not password:
        print("✗ La contraseña no puede estar vacía")
        return
    
    if len(password) < 6:
        print("✗ La contraseña debe tener al menos 6 caracteres")
        return
    
    nombre_completo = input("Nombre completo (opcional): ").strip()
    
    with engine.connect() as conn:
        try:
            # Verificar si ya existe un admin con ese username
            result = conn.execute(text("""
                SELECT username FROM admin WHERE username = :username
            """), {"username": username})
            
            if result.fetchone():
                print(f"✗ Ya existe un administrador con el usuario '{username}'")
                return
            
            # Cifrar contraseña
            password_hash = bcrypt_lib.hashpw(password.encode('utf-8'), bcrypt_lib.gensalt()).decode('utf-8')
            
            # Insertar nuevo admin
            conn.execute(text("""
                INSERT INTO admin (username, password_hash, nombre_completo)
                VALUES (:username, :password_hash, :nombre_completo)
            """), {
                "username": username,
                "password_hash": password_hash,
                "nombre_completo": nombre_completo if nombre_completo else None
            })
            conn.commit()
            
            print(f"\n✓ Administrador '{username}' creado exitosamente")
            print(f"  Nombre: {nombre_completo if nombre_completo else 'N/A'}")
            
        except Exception as e:
            print(f"✗ Error al crear el administrador: {e}")
            conn.rollback()
            raise

def listar_admins():
    """Lista todos los administradores"""
    print("\n=== Administradores registrados ===")
    
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id_admin, username, nombre_completo, created_at
            FROM admin
            ORDER BY created_at
        """))
        
        admins = result.fetchall()
        
        if not admins:
            print("No hay administradores registrados")
            return
        
        print(f"\nTotal: {len(admins)} administrador(es)")
        print("-" * 80)
        for id_admin, username, nombre, created_at in admins:
            print(f"ID: {id_admin}")
            print(f"  Usuario: {username}")
            print(f"  Nombre: {nombre if nombre else 'N/A'}")
            print(f"  Creado: {created_at}")
            print("-" * 80)

if __name__ == "__main__":
    print("=" * 60)
    print("CONFIGURACIÓN DE AUTENTICACIÓN")
    print("=" * 60)
    
    try:
        # Crear tabla
        crear_tabla_admin()
        
        # Listar admins existentes
        listar_admins()
        
        # Preguntar si quiere crear un nuevo admin
        print("\n¿Deseas crear un nuevo administrador? (s/n): ", end="")
        respuesta = input().strip().lower()
        
        if respuesta == 's':
            crear_admin_inicial()
            listar_admins()
        
        print("\n" + "=" * 60)
        print("✓ CONFIGURACIÓN COMPLETADA")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error durante la configuración: {e}")
        import traceback
        traceback.print_exc()
