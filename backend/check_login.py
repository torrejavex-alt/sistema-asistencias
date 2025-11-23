"""
Script para verificar el login manualmente
"""
import os
import bcrypt
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("Error: DATABASE_URL no configurada")
    exit(1)

engine = create_engine(DATABASE_URL)

def verificar_login(username, password):
    print(f"Verificando usuario: {username}")
    
    with engine.connect() as conn:
        # Buscar usuario
        result = conn.execute(text("SELECT id_admin, password_hash FROM admin WHERE username = :u"), {"u": username})
        user = result.fetchone()
        
        if not user:
            print("❌ El usuario NO existe en la base de datos.")
            return
            
        print("✓ Usuario encontrado.")
        stored_hash = user[1]
        
        # Verificar contraseña
        if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            print("✅ ¡Contraseña CORRECTA!")
        else:
            print("❌ Contraseña INCORRECTA.")
            print(f"Hash almacenado: {stored_hash[:20]}...")

if __name__ == "__main__":
    verificar_login("admin", "Admin123!")
