import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.chdir(os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
payload = {
    'date': '2026-10-03',
    'vessel_type': 'Capesize',
    'vessel_size': 185000,
    'origin': 'Port Hedland',
    'destination': 'Qingdao',
    'commodity': 'Iron Ore',
    'distance_nm': 3650,
    'fuel_price': 625,
    'cargo_demand': 105,
    'weather_condition': 'Calm',
    'port_congestion': 2.0
}

tests = [
    ('GET  /api/health',              lambda: client.get('/api/health')),
    ('GET  /api/summary',             lambda: client.get('/api/summary')),
    ('GET  /api/historical?limit=3',  lambda: client.get('/api/historical?limit=3')),
    ('GET  /api/vessels',             lambda: client.get('/api/vessels')),
    ('GET  /api/demand',              lambda: client.get('/api/demand')),
    ('POST /api/forecast',            lambda: client.post('/api/forecast', json=payload)),
    ('POST /api/chartering-decision', lambda: client.post('/api/chartering-decision', json=payload)),
    ('POST /api/forecast (invalid)',  lambda: client.post('/api/forecast', json={'bad': 'data'})),
]

print('=' * 60)
print('FreightAI Endpoint Tests (post Vercel changes)')
print('=' * 60)
all_pass = True
for name, fn in tests:
    try:
        r = fn()
        expected_fail = 'invalid' in name
        ok = (r.status_code == 422) if expected_fail else (r.status_code == 200)
        status = 'PASS' if ok else 'FAIL'
        if not ok:
            all_pass = False
        print('  [' + status + '] ' + name + ' -> HTTP ' + str(r.status_code))
        if name == 'POST /api/forecast':
            d = r.json()
            print('         rate=' + str(d['predicted_freight_rate']) + '  model=' + str(d['model']))
        if name == 'POST /api/chartering-decision':
            d = r.json()
            print('         rec=' + str(d['recommendation']))
    except Exception as e:
        print('  [ERROR] ' + name + ' -> ' + str(e))
        all_pass = False

print('=' * 60)
print('OVERALL: ' + ('ALL PASS' if all_pass else 'SOME FAILURES'))
print('=' * 60)
