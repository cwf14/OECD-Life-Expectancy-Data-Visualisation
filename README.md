# Life Expectancy in OECD Countries (COS 30045: Data Visualisation)

Interactive web-based data visualisation dashboard built with HTML, CSS, JavaScript, and D3.js (v4, v5, and v7) exploring life expectancy and healthcare indicators across OECD countries.

## Visualisations
1. **Life Expectancy by Countries (`Map.html`)** – Interactive world choropleth map with year slider, age group filter (`Y0`, `Y40`, `Y60`, `Y65`, `Y80`), OECD/Non-OECD filter, zoom controls, and highest/lowest summary board.
2. **Life Expectancy by Gender (`ScatterPlot.html`)** – Connected scatter plot comparing female, male, total, and gender-difference trends over time by country and age group.
3. **Causes of Mortality (`StackedBar.html`)** – Stacked bar chart showing deaths per 100,000 inhabitants by cause, with year, region, sorting, and total-view toggles.
4. **Healthcare Coverage (`bubble.html`)** – Force-directed bubble chart showing population covered by government healthcare across OECD countries over time.
5. **Government Health Expenditure (`SpiderChart.html`)** – Radar/spider chart comparing domestic general government health expenditure per capita (PPP) across countries by year and region.

## File Structure
- `Main.html`, `Main.css`, `Main.js` – Main dashboard layout embedding all charts
- `Map.html`, `Map.css`, `Map.js`, `LifeExpectancyMap.csv`
- `ScatterPlot.html`, `ScatterPlot.css`, `ScatterPlot.js`
- `StackedBar.html`, `StackedBar.js`, `DatasetCauseOfMortality.csv`
- `bubble.html`, `bubble.css`, `bubble.js`
- `SpiderChart.html`, `SpiderChart.js`, `latestGovernmentPPP.csv`
- `Stackedbar&Spider.css` – Shared CSS for Stacked Bar and Spider charts
- `image/image1.webp` – About section illustration

## How to Run
An active internet connection (for CDN libraries and external CSVs) and a local HTTP server are required:

1. Using Python:
   ```bash
   python -m http.server 8000
