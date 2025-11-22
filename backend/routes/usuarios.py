from flask import Blueprint, request, jsonify
from models import Usuario
from extensions import db

usuarios_bp = Blueprint('usuarios', __name__)

# GET /api/usuarios
@usuarios_bp.route('', methods=['GET'])
def get_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([{
        'id_usuario': u.id_usuario,
        'nombre': u.nombre,
        'instrumento': u.instrumento
    } for u in usuarios])

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
    db.session.delete(usuario)
    db.session.commit()
    return '', 204