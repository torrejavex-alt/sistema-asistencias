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

    # Crear tablas si no existen (Solución para error 500 por falta de tablas)
    with app.app_context():
        import models  # Importar modelos para que SQLAlchemy los reconozca
        db.create_all()

    # Temporary route to fix DB schema (add missing columns)
    @app.route('/api/fix-db')
    def fix_db():
        from sqlalchemy import text
        try:
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE usuario ADD COLUMN IF NOT EXISTS email VARCHAR(120);"))
                conn.execute(text("ALTER TABLE usuario ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);"))
                conn.execute(text("ALTER TABLE usuario ADD COLUMN IF NOT EXISTS instrumento VARCHAR(100);"))
                conn.commit()
            return "Database schema updated successfully! (Added email, telefono, instrumento)"
        except Exception as e:
            return f"Error updating schema: {str(e)}"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)