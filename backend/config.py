from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or f'sqlite:///{os.path.join(basedir, "asistencias.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False