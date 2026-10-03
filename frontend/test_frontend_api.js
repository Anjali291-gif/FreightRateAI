/**
 * Frontend API Integration Test Script
 * Verifies that the frontend API service layer correctly connects to http://localhost:8000
 * and validates responses for all 6 endpoints:
 * - GET  /api/summary
 * - GET  /api/historical
 * - GET  /api/vessels
 * - GET  /api/demand
 * - POST /api/forecast
 * - POST /api/chartering-decision
 */

const BASE_URL = 'http://localhost:8000/api';

async function testEndpoint(name, url, options = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, options);
    const duration = Date.now() - t0;
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { ok: true, duration, data };
  } catch (err) {
    return { ok: false, duration: Date.now() - t0, error: err.message };
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('     FreightAI Frontend -> Backend Integration Test  ');
  console.log('====================================================\n');

  // 1. Health
  console.log('[1/7] Testing GET /api/health...');
  const health = await testEndpoint('Health', `${BASE_URL}/health`);
  console.log(`      Status: ${health.ok ? 'PASS' : 'FAIL'} (${health.duration}ms)`);
  if (!health.ok) {
    console.error('      Health check failed:', health.error);
    process.exit(1);
  }
  console.log(`      Response: ${JSON.stringify(health.data)}`);

  // 2. Summary
  console.log('\n[2/7] Testing GET /api/summary...');
  const summary = await testEndpoint('Summary', `${BASE_URL}/summary`);
  console.log(`      Status: ${summary.ok ? 'PASS' : 'FAIL'} (${summary.duration}ms)`);
  console.log(`      Rows: ${summary.data.total_dataset_rows} | Avg Rate: $${summary.data.average_freight_rate}/t | Model: ${summary.data.selected_ml_model} (R²: ${summary.data.r2_score})`);

  // 3. Historical
  console.log('\n[3/7] Testing GET /api/historical...');
  const hist = await testEndpoint('Historical', `${BASE_URL}/historical?vessel_type=Capesize&limit=5`);
  console.log(`      Status: ${hist.ok ? 'PASS' : 'FAIL'} (${hist.duration}ms)`);
  console.log(`      Fetched: ${hist.data.length} records. Sample rate: $${hist.data[0]?.freight_rate}/t on ${hist.data[0]?.origin} -> ${hist.data[0]?.destination}`);

  // 4. Vessels
  console.log('\n[4/7] Testing GET /api/vessels...');
  const vessels = await testEndpoint('Vessels', `${BASE_URL}/vessels`);
  console.log(`      Status: ${vessels.ok ? 'PASS' : 'FAIL'} (${vessels.duration}ms)`);
  console.log(`      Total Vessel Types: ${vessels.data.total_vessel_types}. First type: ${vessels.data.vessels[0]?.vessel_type} (Mean DWT: ${vessels.data.vessels[0]?.avg_dwt})`);

  // 5. Demand
  console.log('\n[5/7] Testing GET /api/demand...');
  const demand = await testEndpoint('Demand', `${BASE_URL}/demand`);
  console.log(`      Status: ${demand.ok ? 'PASS' : 'FAIL'} (${demand.duration}ms)`);
  console.log(`      Total Monthly Trend Periods: ${demand.data.total_periods}. First period: ${demand.data.trend[0]?.period} (Avg: ${demand.data.trend[0]?.avg_demand})`);

  // 6. Forecast
  console.log('\n[6/7] Testing POST /api/forecast...');
  const forecastPayload = {
    date: '2026-10-03',
    vessel_type: 'Capesize',
    vessel_size: 185000,
    origin: 'Port Hedland',
    destination: 'Qingdao',
    commodity: 'Iron Ore',
    distance_nm: 3650,
    fuel_price: 625,
    cargo_demand: 105,
    weather_condition: 'Calm',
    port_congestion: 2.0,
  };
  const forecast = await testEndpoint('Forecast', `${BASE_URL}/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(forecastPayload),
  });
  console.log(`      Status: ${forecast.ok ? 'PASS' : 'FAIL'} (${forecast.duration}ms)`);
  console.log(`      Predicted Freight Rate: $${forecast.data.predicted_freight_rate} ${forecast.data.currency}/${forecast.data.unit} (Model: ${forecast.data.model})`);

  // 7. Decision
  console.log('\n[7/7] Testing POST /api/chartering-decision...');
  const decision = await testEndpoint('Decision', `${BASE_URL}/chartering-decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(forecastPayload),
  });
  console.log(`      Status: ${decision.ok ? 'PASS' : 'FAIL'} (${decision.duration}ms)`);
  console.log(`      Recommendation: ${decision.data.recommendation}`);
  console.log(`      Explanation: ${decision.data.explanation.slice(0, 100)}...`);

  console.log('\n====================================================');
  console.log('  ALL 7 ENDPOINTS CONNECTED & VERIFIED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests();
