from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from models import Admin
from extensions import db
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

# POST /api/auth/login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    # Buscar admin por username
    admin = Admin.query.filter_by(username=username).first()
    
    if not admin:
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Verificar contraseña
    if not bcrypt.check_password_hash(admin.password_hash, password):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Crear token JWT
    access_token = create_access_token(
        identity=admin.id_admin,
        additional_claims={
            'username': admin.username,
            'nombre_completo': admin.nombre_completo
        },
        expires_delta=timedelta(hours=8)
    )
    
    return jsonify({
        'access_token': access_token,
        'username': admin.username,
        'nombre_completo': admin.nombre_completo
    }), 200

# GET /api/auth/verify - Verificar si el token es válido
@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify():
    current_admin_id = get_jwt_identity()
    admin = Admin.query.get(current_admin_id)
    
    if not admin:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    return jsonify({
        'username': admin.username,
        'nombre_completo': admin.nombre_completo
    }), 200

# POST /api/auth/register - Crear nuevo admin (solo para setup inicial)
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    nombre_completo = data.get('nombre_completo')
    
    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    # Verificar si el usuario ya existe
    existing_admin = Admin.query.filter_by(username=username).first()
    if existing_admin:
        return jsonify({'error': 'El usuario ya existe'}), 400
    
    # Cifrar contraseña
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Crear nuevo admin
    new_admin = Admin(
        username=username,
        password_hash=password_hash,
        nombre_completo=nombre_completo
    )
    
    try:
        db.session.add(new_admin)
        db.session.commit()
        return jsonify({
            'message': 'Administrador creado exitosamente',
            'username': new_admin.username
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el administrador'}), 500
