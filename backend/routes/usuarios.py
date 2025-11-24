from flask import Blueprint, request, jsonify
from models import Usuario, Asistencia
from extensions import db

usuarios_bp = Blueprint('usuarios', __name__)

# GET /api/usuarios
@usuarios_bp.route('', methods=['GET'])
def get_usuarios():
    try:
        usuarios = Usuario.query.all()
        return jsonify([{
            'id_usuario': u.id_usuario,
            'nombre': u.nombre,
            'instrumento': u.instrumento
        } for u in usuarios])
    except Exception as e:
        print(f"Error getting usuarios: {e}")
        return jsonify({'error': str(e)}), 500

# POST /api/usuarios
@usuarios_bp.route('', methods=['POST'])
def create_usuario():
    data = request.get_json()
    
    # Verificar si el usuario ya existe
    usuario_existente = Usuario.query.filter_by(nombre=data['nombre']).first()
    if usuario_existente:
        return jsonify({'error': 'Ya existe un usuario con ese nombre'}), 400
    
    nuevo = Usuario(
        nombre=data['nombre'],
        instrumento=data.get('instrumento')
    )
    try:
        db.session.add(nuevo)
        db.session.commit()
        return jsonify({
            'id_usuario': nuevo.id_usuario,
            'nombre': nuevo.nombre,
            'instrumento': nuevo.instrumento
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el usuario'}), 500

# PUT /api/usuarios/<int:id>
@usuarios_bp.route('/<int:id>', methods=['PUT'])
def update_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()
    
    # Verificar si el nuevo nombre ya existe en otro usuario
    if data['nombre'] != usuario.nombre:
        usuario_existente = Usuario.query.filter_by(nombre=data['nombre']).first()
        if usuario_existente:
            return jsonify({'error': 'Ya existe un usuario con ese nombre'}), 400
    
    usuario.nombre = data['nombre']
    usuario.instrumento = data.get('instrumento')
    try:
        db.session.commit()
        return jsonify({
            'id_usuario': usuario.id_usuario,
            'nombre': usuario.nombre,
            'instrumento': usuario.instrumento
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al actualizar el usuario'}), 500

# DELETE /api/usuarios/<int:id>
@usuarios_bp.route('/<int:id>', methods=['DELETE'])
def delete_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    
    try:
        # Eliminar todas las asistencias asociadas a este usuario primero
        Asistencia.query.filter_by(id_usuario=id).delete()
        
        # Ahora sí eliminar al usuario
        db.session.delete(usuario)
        db.session.commit()
from flask import Blueprint, request, jsonify
from models import Usuario, Asistencia
from extensions import db

usuarios_bp = Blueprint('usuarios', __name__)

# GET /api/usuarios
@usuarios_bp.route('', methods=['GET'])
def get_usuarios():
    try:
        usuarios = Usuario.query.all()
        return jsonify([{
            'id_usuario': u.id_usuario,
            'nombre': u.nombre,
            'instrumento': u.instrumento
        } for u in usuarios])
    except Exception as e:
        print(f"Error getting usuarios: {e}")
        return jsonify({'error': str(e)}), 500

# POST /api/usuarios
@usuarios_bp.route('', methods=['POST'])
def create_usuario():
    data = request.get_json()
    
    # Verificar si el usuario ya existe
    usuario_existente = Usuario.query.filter_by(nombre=data['nombre']).first()
    if usuario_existente:
        return jsonify({'error': 'Ya existe un usuario con ese nombre'}), 400
    
    nuevo = Usuario(
        nombre=data['nombre'],
        instrumento=data.get('instrumento')
    )
    try:
        db.session.add(nuevo)
        db.session.commit()
        return jsonify({
            'id_usuario': nuevo.id_usuario,
            'nombre': nuevo.nombre,
            'instrumento': nuevo.instrumento
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el usuario'}), 500

# PUT /api/usuarios/<int:id>
@usuarios_bp.route('/<int:id>', methods=['PUT'])
def update_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()
    
    # Verificar si el nuevo nombre ya existe en otro usuario
    if data['nombre'] != usuario.nombre:
        usuario_existente = Usuario.query.filter_by(nombre=data['nombre']).first()
        if usuario_existente:
            return jsonify({'error': 'Ya existe un usuario con ese nombre'}), 400
    
    usuario.nombre = data['nombre']
    usuario.instrumento = data.get('instrumento')
    try:
        db.session.commit()
        return jsonify({
            'id_usuario': usuario.id_usuario,
            'nombre': usuario.nombre,
            'instrumento': usuario.instrumento
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al actualizar el usuario'}), 500

# DELETE /api/usuarios/<int:id>
@usuarios_bp.route('/<int:id>', methods=['DELETE'])
def delete_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    
    try:
        # Eliminar todas las asistencias asociadas a este usuario primero
        Asistencia.query.filter_by(id_usuario=id).delete()
        
        # Ahora sí eliminar al usuario
        db.session.delete(usuario)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al eliminar el usuario'}), 500

# POST /api/usuarios/import (CSV bulk upload)
@usuarios_bp.route('/import', methods=['POST'])
def import_usuarios():
    """Import users from a CSV file.
    Expected columns: nombre,instrumento.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'Archivo no enviado'}), 400
    file = request.files['file']
    
    # Try different encodings
    content = None
    encodings = ['utf-8', 'latin-1', 'cp1252']
    
    file_bytes = file.stream.read()
    
    for encoding in encodings:
        try:
            content = file_bytes.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
            
    if content is None:
        return jsonify({'error': 'No se pudo decodificar el archivo. Asegúrate de que sea UTF-8 o Latin-1.'}), 400
        
    stream = content.splitlines()
    
    # Detect delimiter
    import csv
    if not stream:
        return jsonify({'creados': 0, 'errores': ['El archivo está vacío']}), 200
        
    # Simple sniffer
    first_line = stream[0]
    delimiter = ','
    if '\t' in first_line:
        delimiter = '\t'
    elif ';' in first_line:
        delimiter = ';'
        
    reader = csv.DictReader(stream, delimiter=delimiter)
    
    # Normalize headers (strip BOM, whitespace)
    if reader.fieldnames:
        reader.fieldnames = [h.strip().replace('\ufeff', '') for h in reader.fieldnames]
    
    # Pre-fetch existing names for faster validation
    # We use a set for O(1) lookups
    existing_names = set(u.nombre for u in Usuario.query.with_entities(Usuario.nombre).all())
    
    creados = 0
    errores = []
    nuevos_usuarios = []
    
    for idx, row in enumerate(reader, start=2):  # start=2 accounting header line
        nombre = row.get('nombre')
        if not nombre:
            # Try to see if it's in the first column regardless of header name if 'nombre' is missing
            # This is a fallback for files with wrong headers but correct data structure
            # But risky. Let's stick to strict but helpful error.
            errores.append(f'Línea {idx}: nombre vacío (revisar encabezados)')
            continue
            
        # Verificar duplicado (en DB o en el lote actual)
        if nombre in existing_names:
            errores.append(f'Línea {idx}: usuario "{nombre}" ya existe')
            continue
            
        nuevo = Usuario(
            nombre=nombre,
            instrumento=row.get('instrumento') or None,
            email=row.get('email') or None,
            telefono=row.get('telefono') or None,
        )
        nuevos_usuarios.append(nuevo)
        existing_names.add(nombre) # Add to set to prevent duplicates within the file
        creados += 1
        
    if nuevos_usuarios:
        try:
            db.session.bulk_save_objects(nuevos_usuarios)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Error al guardar usuarios', 'details': str(e)}), 500
            
    return jsonify({'creados': creados, 'errores': errores}), 201