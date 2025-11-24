from flask import Blueprint, request, jsonify
from models import Asistencia, Usuario, Evento, TipoAsistencia
from extensions import db
from datetime import datetime
import csv

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

# POST /api/asistencias/import (CSV bulk upload)
@asistencias_bp.route('/import', methods=['POST'])
def import_asistencias():
    """Import attendances from a CSV file.
    Expected columns: fecha, usuario, estado.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'Archivo no enviado'}), 400
    file = request.files['file']
    try:
        stream = file.stream.read().decode('utf-8').splitlines()
    except UnicodeDecodeError:
        return jsonify({'error': 'El archivo debe estar en formato UTF-8'}), 400
        
    reader = csv.DictReader(stream)
    rows = list(reader)
    
    if not rows:
        return jsonify({'creados': 0, 'errores': ['El archivo está vacío']}), 200

    # 1. Caches
    usuarios_map = {u.nombre: u.id_usuario for u in Usuario.query.with_entities(Usuario.nombre, Usuario.id_usuario).all()}
    tipos_map = {t.descripcion: t.id_tipo for t in TipoAsistencia.query.with_entities(TipoAsistencia.descripcion, TipoAsistencia.id_tipo).all()}
    eventos_map = {e.fecha.isoformat(): e.id_evento for e in Evento.query.with_entities(Evento.fecha, Evento.id_evento).all()}
    
    # 2. Identify and create new events
    fechas_procesadas = set()
    nuevos_eventos = []
    
    for row in rows:
        fecha_str = row.get('fecha')
        if not fecha_str:
            continue
            
        # Parse date
        fecha_obj = None
        try:
            fecha_obj = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            try:
                fecha_obj = datetime.strptime(fecha_str, '%d/%m/%Y').date()
            except ValueError:
                continue # Will be caught in next loop
        
        if fecha_obj:
            fecha_iso = fecha_obj.isoformat()
            if fecha_iso not in eventos_map and fecha_iso not in fechas_procesadas:
                nuevos_eventos.append(Evento(fecha=fecha_obj))
                fechas_procesadas.add(fecha_iso)
    
    if nuevos_eventos:
        try:
            db.session.add_all(nuevos_eventos)
            db.session.commit()
            # Refresh map
            eventos_map = {e.fecha.isoformat(): e.id_evento for e in Evento.query.with_entities(Evento.fecha, Evento.id_evento).all()}
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Error al crear eventos nuevos', 'details': str(e)}), 500

    # 3. Create Asistencias
    creados = 0
    errores = []
    nuevas_asistencias = []
    # To prevent duplicates in the same batch or DB
    # We can fetch existing (user, event) pairs?
    # For 2000 records, fetching all might be too much if table is huge.
    # But checking one by one is slow.
    # Let's assume we trust the user or catch integrity errors?
    # Better: Fetch existing asistencias for the involved events.
    
    # Get IDs of events involved
    involved_event_ids = set()
    for row in rows:
        # ... (parsing logic again, or we could have stored it)
        pass 
    
    # Simplified approach: Try to insert, if fails, it fails? No, we want partial success or at least reporting.
    # Let's use a set of (id_usuario, id_evento) to check against DB.
    
    # Fetch all asistencias (id_usuario, id_evento) tuples.
    # If table is huge, this is bad.
    # But for a "prueba barata", maybe it's fine.
    # Optimization: Filter by involved events.
    
    # Let's just iterate and build valid objects, then use bulk_save_objects.
    # We will skip if (user, event) already exists in our "to be created" list.
    # What about DB duplicates?
    # We can use `db.session.merge`? No, that updates.
    # We can ignore duplicates?
    
    # Let's try to be robust but simple.
    
    existing_keys = set()
    # We will query DB for the events we are touching.
    relevant_dates = fechas_procesadas.union(set(eventos_map.keys())) # Actually we only care about dates in CSV.
    
    # Let's just process.
    
    batch_keys = set() # (id_usuario, id_evento)
    
    for idx, row in enumerate(rows, start=2):
        fecha_str = row.get('fecha')
        nombre_usuario = row.get('usuario')
        estado_desc = row.get('estado')
        
        if not fecha_str or not nombre_usuario or not estado_desc:
            errores.append(f'Línea {idx}: datos incompletos')
            continue
            
        # Parse date
        fecha_obj = None
        try:
            fecha_obj = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            try:
                fecha_obj = datetime.strptime(fecha_str, '%d/%m/%Y').date()
            except ValueError:
                errores.append(f'Línea {idx}: fecha inválida "{fecha_str}"')
                continue
        
        fecha_iso = fecha_obj.isoformat()
        
        id_evento = eventos_map.get(fecha_iso)
        if not id_evento:
             errores.append(f'Línea {idx}: evento no encontrado (error interno)')
             continue
             
        id_usuario = usuarios_map.get(nombre_usuario)
        if not id_usuario:
            errores.append(f'Línea {idx}: usuario "{nombre_usuario}" no encontrado')
            continue
            
        id_tipo = tipos_map.get(estado_desc)
        if not id_tipo:
            # Try some fuzzy matching or defaults?
            # Let's handle "Asistio" vs "Asistió"
            # Maybe the user sends "Falta" instead of "No asistió"
            # For now strict.
            errores.append(f'Línea {idx}: estado "{estado_desc}" no válido')
            continue
            
        key = (id_usuario, id_evento)
        if key in batch_keys:
            errores.append(f'Línea {idx}: registro duplicado en el archivo')
            continue
            
        batch_keys.add(key)
        
        # We should check if it exists in DB.
        # Doing a query per row is slow.
        # Let's assume we want to overwrite? Or skip?
        # Let's skip if exists.
        # We can fetch existing for this event.
        
        nuevas_asistencias.append(Asistencia(
            id_usuario=id_usuario,
            id_evento=id_evento,
            id_tipo=id_tipo
        ))
        creados += 1

    # Now we have a list of Asistencia objects.
    # If we just bulk save, we might hit IntegrityError if they exist.
    # We can use `merge` to update existing ones?
    # Or we can filter out existing ones.
    
    if nuevas_asistencias:
        try:
            # Using merge results in updates, which is probably fine/better for import.
            # But bulk_save_objects is faster.
            # Let's use bulk_save_objects but we need to ensure no PK conflicts.
            
            # Fetch existing PKs for these events
            relevant_event_ids = set(a.id_evento for a in nuevas_asistencias)
            existing_db_keys = set(
                db.session.query(Asistencia.id_usuario, Asistencia.id_evento)
                .filter(Asistencia.id_evento.in_(relevant_event_ids))
                .all()
            )
            
            final_list = []
            for a in nuevas_asistencias:
                if (a.id_usuario, a.id_evento) not in existing_db_keys:
                    final_list.append(a)
                else:
                    # If it exists, we could update it?
                    # For now, let's just skip and maybe warn?
                    # Or update. Update is better for "Import/Sync".
                    # But bulk update is hard.
                    # Let's just insert new ones for now to avoid complexity.
                    pass
            
            if final_list:
                db.session.bulk_save_objects(final_list)
                db.session.commit()
                # Adjust creados count
                creados = len(final_list)
            else:
                creados = 0
                if not errores:
                    errores.append("Todos los registros ya existían.")
                    
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Error al guardar asistencias', 'details': str(e)}), 500

    return jsonify({'creados': creados, 'errores': errores}), 201