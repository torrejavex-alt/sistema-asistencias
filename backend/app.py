# app.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import db, bcrypt
from config import Config
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configuración JWT
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'tu-clave-secreta-super-segura-cambiar-en-produccion')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 28800  # 8 horas
    
    CORS(app)
    jwt = JWTManager(app)

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"error": "Token inválido", "details": error}, 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {"error": "Falta el token de autorización", "details": error}, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"error": "El token ha expirado", "details": "token_expired"}, 401

    # Inicializa la base de datos y bcrypt con la app
    db.init_app(app)
    bcrypt.init_app(app)

    # Registra blueprints
    from routes.usuarios import usuarios_bp
    from routes.eventos import eventos_bp
    from routes.asistencias import asistencias_bp
    from routes.auth import auth_bp

    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
    app.register_blueprint(eventos_bp, url_prefix='/api/eventos')
    app.register_blueprint(asistencias_bp, url_prefix='/api/asistencias')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # Crear tablas si no existen y actualizar esquema
    with app.app_context():
        import models
        db.create_all()
        
        # Auto-migración: Asegurar que existan las nuevas columnas
        # Esto se ejecuta cada vez que inicia la app para "reparar" la BD automáticamente
        from sqlalchemy import text
        try:
            with db.engine.connect() as conn:
                # Intentamos agregar las columnas. Si ya existen, Postgres con IF NOT EXISTS no falla.
                conn.execute(text("ALTER TABLE usuario ADD COLUMN IF NOT EXISTS email VARCHAR(120);"))
                conn.execute(text("ALTER TABLE usuario ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);"))
                conn.execute(text("ALTER TABLE usuario ADD COLUMN IF NOT EXISTS instrumento VARCHAR(100);"))
                conn.commit()
            print("✓ Esquema de base de datos actualizado correctamente.")
        except Exception as e:
            # Si falla (ej. base de datos no soporta IF NOT EXISTS o error de conexión), lo logueamos pero no detenemos la app
            print(f"⚠ Advertencia al actualizar esquema: {e}")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)