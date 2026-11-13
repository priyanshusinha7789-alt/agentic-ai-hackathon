import sys
import os

# Ensure backend directory is in sys.path so app modules can be imported
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database import init_db

try:
    init_db()
except Exception as e:
    print(f"Database init notice: {e}")
