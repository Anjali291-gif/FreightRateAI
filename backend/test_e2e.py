import urllib.request, json

def test(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else:
        body = None
    try:
        with urllib.request.urlopen(req, data=body) as res:
            return res.status, json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

print('--- HEALTH ---')
s, d = test('http://localhost:8000/api/health')
print('Status:', s, d)

print('\n--- SUMMARY ---')
s, d = test('http://localhost:8000/api/summary')
print('Status:', s, 'Model:', d.get('selected_ml_model'), 'R2:', d.get('r2_score'))

print('\n--- HISTORICAL ---')
s, d = test('http://localhost:8000/api/historical?limit=5')
print('Status:', s, 'Type:', type(d).__name__, 'Count:', len(d) if isinstance(d, list) else len(d.get('records', [])))
if isinstance(d, list) and len(d) > 0:
    print('Sample record keys:', list(d[0].keys()))

print('\n--- VESSELS ---')
s, d = test('http://localhost:8000/api/vessels')
print('Status:', s, 'Type:', type(d).__name__, 'Count:', len(d.get('vessels', [])) if isinstance(d, dict) else len(d))

print('\n--- DEMAND ---')
s, d = test('http://localhost:8000/api/demand')
print('Status:', s, 'Type:', type(d).__name__, 'Count:', len(d.get('trend', [])) if isinstance(d, dict) else len(d))

print('\n--- FORECAST ---')
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
s, d = test('http://localhost:8000/api/forecast', 'POST', payload)
print('Status:', s, 'Forecast:', d)

print('\n--- CHARTERING DECISION ---')
s, d = test('http://localhost:8000/api/chartering-decision', 'POST', payload)
print('Status:', s, 'Decision:', d)

print('\n--- INVALID FORECAST ---')
bad_payload = {'date': 'invalid', 'vessel_type': 'Capesize'}
s, d = test('http://localhost:8000/api/forecast', 'POST', bad_payload)
print('Status:', s, 'Validation Error Response:', 'detail' in d)
