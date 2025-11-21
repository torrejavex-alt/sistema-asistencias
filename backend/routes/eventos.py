from flask import Blueprint, request, jsonify
from models import Evento
from extensions import db
from datetime import datetime

eventos_bp = Blueprint('eventos', __name__)

@eventos_bp.route('', methods=['GET'])
def get_eventos():
    eventos = Evento.query.all()
    return jsonify([{
        'id_evento': e.id_evento,
        'fecha': e.fecha.isoformat()
    } for e in eventos])

@eventos_bp.route('', methods=['POST'])
def create_evento():
    data = request.get_json()
    fecha = datetime.fromisoformat(data['fecha']).date()
    nuevo = Evento(fecha=fecha)
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({
        'id_evento': nuevo.id_evento,
        'fecha': nuevo.fecha.isoformat()
    }), 201

@eventos_bp.route('/<int:id>', methods=['PUT'])
def update_evento(id):
    evento = Evento.query.get_or_404(id)
    data = request.get_json()
    evento.fecha = datetime.fromisoformat(data['fecha']).date()
    db.session.commit()
    return jsonify({
        'id_evento': evento.id_evento,
        'fecha': evento.fecha.isoformat()
    })

@eventos_bp.route('/<int:id>', methods=['DELETE'])
def delete_evento(id):
    evento = Evento.query.get_or_404(id)
    db.session.delete(evento)
    db.session.commit()
    return '', 204