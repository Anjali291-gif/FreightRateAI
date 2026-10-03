"""
FreightAI – Vercel Serverless Entry Point
==========================================
This file is the bridge between Vercel's Python serverless runtime and the
existing FastAPI application in backend/.

Vercel discovers this file at api/index.py and routes all /api/* requests here.
The existing backend code is unchanged; we simply add the backend/ directory
to sys.path so the imports resolve correctly.

Local development continues to use uvicorn (python main.py in backend/).
"""

import sys
import os

# ---------------------------------------------------------------------------
# Resolve paths so backend modules are importable from Vercel's /var/task root
# ---------------------------------------------------------------------------
_api_dir  = os.path.dirname(os.path.abspath(__file__))   # /var/task/api  OR  .../FreightAI/api
_root_dir = os.path.dirname(_api_dir)                     # /var/task      OR  .../FreightAI
_backend_dir = os.path.join(_root_dir, "backend")         # /var/task/backend

# Prepend both so relative imports inside backend/ work identically
for _p in (_backend_dir, _root_dir):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# Set PROJECT_ROOT so analytics_service and predict.py can resolve data/ and models/
os.environ.setdefault("PROJECT_ROOT", _root_dir)

# ---------------------------------------------------------------------------
# Import the existing FastAPI application — ALL routes/middleware are preserved
# ---------------------------------------------------------------------------
from main import app  # noqa: E402

# Vercel's Python runtime detects the `app` ASGI object automatically.
# No extra adapter (mangum / starlette) is needed.
