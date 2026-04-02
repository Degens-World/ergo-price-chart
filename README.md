# ERG Price Chart

Live Ergo (ERG) market dashboard with historical price chart, powered by CoinGecko public API.

## Features

- **Live price** with 24h change indicator
- **Key stats**: market cap, 24h volume, all-time high, market rank
- **Interactive price chart** using Chart.js with area fill
- **Time range selector**: 7D, 30D, 90D, 1Y
- **Extended stats**: 7D / 30D change %, circulating supply, max supply
- Dark crypto-themed UI, fully responsive

## How to Use

1. Open the app in any browser
2. Live ERG stats load automatically from CoinGecko
3. Click 7D / 30D / 90D / 1Y to change the chart time range
4. Hover the chart to see exact prices on each date

## How to Run Locally

```bash
# No build step needed — pure HTML/CSS/JS
# Just open index.html in a browser, or serve with any static server:

npx serve .
# or
python -m http.server 8080
```

Then open http://localhost:8080

## Data Source

All data fetched from the [CoinGecko public API](https://www.coingecko.com/en/api) — no API key required.

> CoinGecko free tier has rate limits (~30 calls/min). If you see a rate-limit error, wait a moment and refresh.

## Tech Stack

- Vanilla HTML / CSS / JavaScript
- [Chart.js 4.4](https://www.chartjs.org/) — charting
- CoinGecko REST API — market data

## Part of Degens.World

Built as part of the [Degens.World](https://degens.world) Ergo ecosystem tools collection.
