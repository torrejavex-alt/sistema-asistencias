from app import create_app
from models import TipoAsistencia
from extensions import db

app = create_app()

with app.app_context():
    tipos = TipoAsistencia.query.all()
    print("\n=== TIPOS DE ASISTENCIA EN LA BASE DE DATOS ===")
    for tipo in tipos:
        print(f"ID: {tipo.id_tipo} - Descripción: '{tipo.descripcion}'")
    print(f"\nTotal: {len(tipos)} tipos")
