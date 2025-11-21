from app import create_app
from extensions import db
from models import Usuario, Evento, Asistencia, TipoAsistencia

app = create_app()

with app.app_context():
    # Crear todas las tablas
    db.create_all()
    
    # Verificar si ya existen tipos de asistencia
    if TipoAsistencia.query.count() == 0:
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
    
    print("✓ Base de datos inicializada correctamente")
