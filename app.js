const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const ERGO_ID = 'ergo';

let chart = null;
let currentDays = 30;

// ── Formatters ──────────────────────────────────────────────────────────────

function formatPrice(n) {
  if (n == null) return '—';
  if (n >= 1) return '$' + n.toFixed(4);
  return '$' + n.toPrecision(4);
}

function formatLarge(n) {
  if (n == null) return '—';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
  return '$' + n.toFixed(2);
}

function formatSupply(n) {
  if (n == null) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B ERG';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M ERG';
  return n.toLocaleString() + ' ERG';
}

function formatChange(pct) {
  if (pct == null) return { text: '—', cls: '' };
  const sign = pct >= 0 ? '+' : '';
  return { text: `${sign}${pct.toFixed(2)}%`, cls: pct >= 0 ? 'up' : 'down' };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchCoinData() {
  const url = `${COINGECKO_BASE}/coins/${ERGO_ID}?localization=false&tickers=false&community_data=false&developer_data=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  return res.json();
}

async function fetchPriceHistory(days) {
  const url = `${COINGECKO_BASE}/coins/${ERGO_ID}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 30 ? 'daily' : 'daily'}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko chart error: ${res.status}`);
  return res.json();
}

// ── Stats rendering ──────────────────────────────────────────────────────────

function renderStats(data) {
  const mkt = data.market_data;

  document.getElementById('val-price').textContent = formatPrice(mkt.current_price?.usd);

  const ch24 = formatChange(mkt.price_change_percentage_24h);
  const el24 = document.getElementById('val-change-24h');
  el24.textContent = ch24.text;
  el24.className = 'stat-change ' + ch24.cls;

  document.getElementById('val-mcap').textContent = formatLarge(mkt.market_cap?.usd);
  document.getElementById('val-vol').textContent = formatLarge(mkt.total_volume?.usd);
  document.getElementById('val-ath').textContent = formatPrice(mkt.ath?.usd);
  document.getElementById('val-ath-date').textContent = mkt.ath_date?.usd ? formatDate(mkt.ath_date.usd) : '';
  document.getElementById('val-rank').textContent = data.market_cap_rank ? `#${data.market_cap_rank}` : '—';

  const ch7 = formatChange(mkt.price_change_percentage_7d);
  const el7 = document.getElementById('val-change-7d');
  el7.textContent = ch7.text;
  el7.className = 'extra-value ' + ch7.cls;

  const ch30 = formatChange(mkt.price_change_percentage_30d);
  const el30 = document.getElementById('val-change-30d');
  el30.textContent = ch30.text;
  el30.className = 'extra-value ' + ch30.cls;

  document.getElementById('val-supply').textContent = formatSupply(mkt.circulating_supply);
  document.getElementById('val-max-supply').textContent = formatSupply(mkt.max_supply);
}

// ── Chart rendering ──────────────────────────────────────────────────────────

function buildGradient(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, 300);
  grad.addColorStop(0, 'rgba(255,107,53,0.28)');
  grad.addColorStop(1, 'rgba(255,107,53,0.02)');
  return grad;
}

function renderChart(prices) {
  const labels = prices.map(([ts]) =>
    new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );
  const values = prices.map(([, v]) => v);

  const canvas = document.getElementById('priceChart');
  const ctx = canvas.getContext('2d');

  if (chart) { chart.destroy(); chart = null; }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'ERG (USD)',
        data: values,
        borderColor: '#ff6b35',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#ff6b35',
        fill: true,
        backgroundColor: buildGradient(ctx),
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a2235',
          borderColor: '#1e2d45',
          borderWidth: 1,
          titleColor: '#6b7a99',
          bodyColor: '#e8edf5',
          bodyFont: { weight: 'bold', size: 14 },
          padding: 12,
          callbacks: {
            label: ctx => ' $' + ctx.parsed.y.toFixed(4)
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(30,45,69,0.6)' },
          ticks: {
            color: '#6b7a99',
            maxTicksLimit: currentDays <= 30 ? 10 : 12,
            font: { size: 11 }
          }
        },
        y: {
          position: 'right',
          grid: { color: 'rgba(30,45,69,0.6)' },
          ticks: {
            color: '#6b7a99',
            font: { size: 11 },
            callback: v => '$' + v.toFixed(4)
          }
        }
      }
    }
  });
}

// ── Loading the chart for selected range ─────────────────────────────────────

async function loadChart(days) {
  const overlay = document.getElementById('chart-loading');
  overlay.classList.remove('hidden');

  try {
    const { prices } = await fetchPriceHistory(days);
    renderChart(prices);
  } catch (err) {
    showError('Failed to load chart data. CoinGecko may be rate-limiting — try again in a moment.');
    console.error(err);
  } finally {
    overlay.classList.add('hidden');
  }
}

// ── Error display ────────────────────────────────────────────────────────────

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 8000);
}

// ── Range button wiring ──────────────────────────────────────────────────────

document.querySelectorAll('.range-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDays = parseInt(btn.dataset.days, 10);
    await loadChart(currentDays);
  });
});

// ── Boot ─────────────────────────────────────────────────────────────────────

async function init() {
  try {
    const coinData = await fetchCoinData();
    renderStats(coinData);
  } catch (err) {
    showError('Failed to load market data. CoinGecko may be rate-limiting — try again in a moment.');
    console.error(err);
  }

  await loadChart(currentDays);
}

init();
