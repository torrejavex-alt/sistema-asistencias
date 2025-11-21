# app.py
from flask import Flask
from flask_cors import CORS
from extensions import db  # ← Importa db desde extensions
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Inicializa la base de datos con la app
    db.init_app(app)

    # Registra blueprints
    # Dentro de create_app()
    from routes.usuarios import usuarios_bp
    from routes.eventos import eventos_bp
    from routes.asistencias import asistencias_bp

    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
    app.register_blueprint(eventos_bp, url_prefix='/api/eventos')
    app.register_blueprint(asistencias_bp, url_prefix='/api/asistencias')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)


    