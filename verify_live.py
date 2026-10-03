import urllib.request, json, sys

BASE = 'http://localhost:8000/api'

def check(label, url, method='GET', data=None):
    try:
        if data:
            req = urllib.request.Request(
                url,
                json.dumps(data).encode(),
                {'Content-Type': 'application/json'},
                method='POST'
            )
        else:
            req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as r:
            body = json.loads(r.read())
            print('[PASS] ' + label + ' -> HTTP ' + str(r.status))
            return body
    except Exception as e:
        print('[FAIL] ' + label + ' -> ' + str(e))
        return None

payload = {
    'date': '2026-10-03', 'vessel_type': 'Capesize', 'vessel_size': 185000,
    'origin': 'Port Hedland', 'destination': 'Qingdao', 'commodity': 'Iron Ore',
    'distance_nm': 3650, 'fuel_price': 625, 'cargo_demand': 105,
    'weather_condition': 'Calm', 'port_congestion': 2.0
}

r1 = check('GET /api/health',              BASE + '/health')
r2 = check('GET /api/summary',             BASE + '/summary')
r3 = check('GET /api/historical?limit=3',  BASE + '/historical?limit=3')
r4 = check('GET /api/vessels',             BASE + '/vessels')
r5 = check('GET /api/demand',              BASE + '/demand')
r6 = check('POST /api/forecast',           BASE + '/forecast',            'POST', payload)
r7 = check('POST /api/chartering-decision',BASE + '/chartering-decision', 'POST', payload)

print()
print('=== KEY LIVE VALUES ===')
if r2:
    print('  Avg Freight Rate : USD ' + str(r2.get('avg_freight_rate')))
    print('  Avg Cargo Demand : '     + str(r2.get('avg_cargo_demand')))
    print('  Avg Fuel Price   : USD ' + str(r2.get('avg_fuel_price')))
    print('  Selected Model   : '     + str(r2.get('selected_model')))
    print('  R2 Score         : '     + str(r2.get('r2_score')))
    print('  Dataset Rows     : '     + str(r2.get('total_rows')))
if r4:
    print('  Vessel Types     : '     + str(len(r4.get('vessels', []))))
if r5:
    print('  Demand Periods   : '     + str(len(r5.get('demand_trend', []))))
if r6:
    print('  Forecast Rate    : USD ' + str(r6.get('predicted_freight_rate')) + ' / ' + str(r6.get('unit')))
    print('  Forecast Model   : '     + str(r6.get('model')))
if r7:
    print('  Recommendation   : '     + str(r7.get('recommendation')))
    print('  Explanation      : '     + str(r7.get('explanation', ''))[:80] + '...')
