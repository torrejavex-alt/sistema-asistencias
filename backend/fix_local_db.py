
from app import create_app
from extensions import db
from models import Admin
import bcrypt

app = create_app()

with app.app_context():
    # Create tables (Admin should be created now that it is imported)
    db.create_all()
    
    # Create admin user if not exists
    if not Admin.query.filter_by(username='admin').first():
        hashed_pw = bcrypt.hashpw('Admin123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin = Admin(username='admin', password_hash=hashed_pw, nombre_completo='Admin Local')
        db.session.add(admin)
        db.session.commit()
        print("Admin user created.")
    else:
        print("Admin user already exists.")
