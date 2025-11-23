from flask import Blueprint, request, jsonify
from models import Asistencia, Usuario, Evento, TipoAsistencia
from extensions import db

asistencias_bp = Blueprint('asistencias', __name__)

# GET /api/asistencias
@asistencias_bp.route('', methods=['GET'])
def get_asistencias():
    asistencias = db.session.query(Asistencia, Usuario, Evento, TipoAsistencia)\
        .join(Usuario, Asistencia.id_usuario == Usuario.id_usuario)\
        .join(Evento, Asistencia.id_evento == Evento.id_evento)\
        .join(TipoAsistencia, Asistencia.id_tipo == TipoAsistencia.id_tipo)\
        .all()
    
    return jsonify([{
        'id_usuario': a.id_usuario,
        'id_evento': a.id_evento,
        'id_tipo': a.id_tipo,
        'usuario': u.nombre,
        'instrumento': u.instrumento,
        'fecha': e.fecha.isoformat(),
        'estado': t.descripcion
    } for a, u, e, t in asistencias])

# POST /api/asistencias
@asistencias_bp.route('', methods=['POST'])
def create_asistencia():
    data = request.get_json()
    
    # Verificar si ya existe un registro para este usuario en este evento
    asistencia_existente = Asistencia.query.filter_by(
        id_usuario=data['id_usuario'],
        id_evento=data['id_evento']
    ).first()
    
    if asistencia_existente:
        return jsonify({'error': 'Ya existe un registro de asistencia para este usuario en esta fecha'}), 400
    
    nueva = Asistencia(
        id_usuario=data['id_usuario'],
        id_evento=data['id_evento'],
        id_tipo=data['id_tipo']
    )
    try:
        db.session.add(nueva)
        db.session.commit()
        return jsonify({
            'id_usuario': nueva.id_usuario,
            'id_evento': nueva.id_evento,
            'id_tipo': nueva.id_tipo
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el registro de asistencia'}), 500

# PUT /api/asistencias/<int:id_usuario>/<int:id_evento>
@asistencias_bp.route('/<int:id_usuario>/<int:id_evento>', methods=['PUT'])
def update_asistencia(id_usuario, id_evento):
    asistencia = Asistencia.query.get_or_404((id_usuario, id_evento))
    data = request.get_json()
    asistencia.id_tipo = data['id_tipo']
    try:
        db.session.commit()
        return jsonify({
            'id_usuario': asistencia.id_usuario,
            'id_evento': asistencia.id_evento,
            'id_tipo': asistencia.id_tipo
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al actualizar el registro de asistencia'}), 500

# DELETE /api/asistencias/<int:id_usuario>/<int:id_evento>
@asistencias_bp.route('/<int:id_usuario>/<int:id_evento>', methods=['DELETE'])
def delete_asistencia(id_usuario, id_evento):
    asistencia = Asistencia.query.get_or_404((id_usuario, id_evento))
    db.session.delete(asistencia)
    db.session.commit()
    return '', 204


# Reporte de asistencias por fecha
@asistencias_bp.route('/reporte-por-fecha')
def reporte_por_fecha():
    # Obtener solo las fechas que tienen al menos un registro de asistencia
    fechas = db.session.query(Evento.fecha)\
        .join(Asistencia, Evento.id_evento == Asistencia.id_evento)\
        .distinct()\
        .order_by(Evento.fecha)\
        .all()
    fechas_list = [f.fecha.isoformat() for f in fechas]

    # Obtener todos los usuarios
    usuarios = Usuario.query.all()

    # Construir el reporte
    reporte = []
    for usuario in usuarios:
        # Obtener asistencias del usuario
        asistencias = db.session.query(Asistencia, Evento.fecha, TipoAsistencia.descripcion)\
            .join(Evento, Asistencia.id_evento == Evento.id_evento)\
            .join(TipoAsistencia, Asistencia.id_tipo == TipoAsistencia.id_tipo)\
            .filter(Asistencia.id_usuario == usuario.id_usuario)\
            .all()
        
        # Crear un diccionario fecha -> estado
        asist_dict = {fecha.isoformat(): estado for _, fecha, estado in asistencias}
        
        # Rellenar con "No convocado" si no hay registro para esa fecha
        fila = {
            'nombre': usuario.nombre,
            'instrumento': usuario.instrumento,
            **{fecha: asist_dict.get(fecha, 'No convocado') for fecha in fechas_list}
        }
        reporte.append(fila)

    return jsonify({
        'fechas': fechas_list,
        'registros': reporte
    })


# DELETE all asistencias
@asistencias_bp.route('/delete-all', methods=['DELETE'])
def delete_all_asistencias():
    try:
        num_deleted = db.session.query(Asistencia).delete()
        db.session.commit()
        return jsonify({
            'message': f'Se eliminaron {num_deleted} registros de asistencia',
            'deleted_count': num_deleted
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al eliminar registros: {str(e)}'}), 500


# DELETE asistencias by user
@asistencias_bp.route('/delete-by-user/<int:id_usuario>', methods=['DELETE'])
def delete_asistencias_by_user(id_usuario):
    try:
        num_deleted = db.session.query(Asistencia)\
            .filter(Asistencia.id_usuario == id_usuario)\
            .delete()
        db.session.commit()
        return jsonify({
            'message': f'Se eliminaron {num_deleted} registros de asistencia del usuario',
            'deleted_count': num_deleted
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al eliminar registros: {str(e)}'}), 500