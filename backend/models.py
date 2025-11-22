# models.py
from extensions import db

class Usuario(db.Model):
    __tablename__ = 'usuario'
    id_usuario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    instrumento = db.Column(db.String(100))

class Evento(db.Model):
    __tablename__ = 'evento'
    id_evento = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)

class TipoAsistencia(db.Model):
    __tablename__ = 'tipo_asistencia'
    id_tipo = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(50), unique=True, nullable=False)

class Asistencia(db.Model):
    __tablename__ = 'asistencia'
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), primary_key=True)
    id_evento = db.Column(db.Integer, db.ForeignKey('evento.id_evento'), primary_key=True)
    id_tipo = db.Column(db.Integer, db.ForeignKey('tipo_asistencia.id_tipo'), nullable=False)

class Admin(db.Model):
    __tablename__ = 'admin'
    id_admin = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nombre_completo = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.now())