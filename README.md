# Life Expectancy in OECD Countries

An interactive web-based data visualisation dashboard built for **COS 30045: Data Visualisation (Group 17)**. This project explores life expectancy trends across OECD countries and examines how they relate to age, gender, causes of mortality, government healthcare coverage, and public health expenditure (PPP).

🔗 **Live Demo:** `https://cwf14.github.io/OECD-Life-Expectancy-Data-Visualisation/`

---

## Table of Contents
- [Overview](#overview)
- [Visualisations & Features](#visualisations--features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)
- [Deployment (GitHub Pages)](#deployment-github-pages)
- [Data Sources](#data-sources)

---

## Overview
Life expectancy is a key indicator of population health and well-being. Across regions and countries, differences in life expectancy are shaped by access to quality healthcare, socioeconomic conditions, leading causes of mortality, healthcare coverage levels, and government health spending.

This dashboard integrates **five interactive D3.js visualisations** inside a single cohesive webpage (`Main.html`) featuring smooth section navigation, a sticky auto-showing top navigation bar on scroll, and a back-to-top button.

---

## Visualisations & Features

### 1. Global Age Group Indicators Across Countries (`Map.html`)
- **Chart Type:** Interactive Choropleth World Map (`d3.geoNaturalEarth1` projection + TopoJSON).
- **Dataset:** `LifeExpectancyMap.csv`
- **Features:**
  - Filter countries by **All Countries**, **OECD Countries**, or **Non-OECD Countries**.
  - Switch between age groups: **`Y0`** (Newborn), **`Y40`**, **`Y60`**, **`Y65`**, and **`Y80`**.
  - Interactive **Year Slider** to observe changes over time.
  - **Zoom & Pan** controls (`+`, `-`, `Reset`) and **Reset Filter** button.
  - Collapsible **Info Board** highlighting the countries with the highest and lowest life expectancy for the selected filters.
  - Hover tooltips showing exact life expectancy values.

### 2. Life Expectancy Trends by Gender Across OECD Countries (`ScatterPlot.html`)
- **Chart Type:** Multi-series Connected Scatter Plot (2000–2023).
- **Dataset:** `LifeExpectancy.csv` (loaded remotely via GitHub raw URL).
- **Features:**
  - Dropdown selectors for **Country** and **Age Group**.
  - Compares **Female**, **Male**, **Total**, and **Gender Difference** (`LFEXPDFM`) trends sequentially over time.
  - Smooth animated transitions when switching countries or age groups.
  - Hover tooltips displaying country, sex, age group, year, and observed value.

### 3. Causes of Mortality Across OECD Countries (`StackedBar.html`)
- **Chart Type:** Animated Stacked Bar Chart (deaths per 100,000 inhabitants, even years).
- **Dataset:** `DatasetCauseOfMortality.csv`
- **Features:**
  - **Year Selector** dropdown.
  - **Sort By** options: Default, Highest to Lowest, Lowest to Highest, Alphabetic (A–Z / Z–A).
  - **Region Filter:** North America, South America, Europe, Asia-Pacific, Middle East, or Default (All).
  - **Show Total / Hide Total** toggle button and **Reset** button.
  - Colour-coded legend and interactive tooltips showing country full name, cause of death, and mortality rate.

### 4. Healthcare Coverage Levels Across OECD Countries (`bubble.html`)
- **Chart Type:** Force-Directed Bubble Chart.
- **Dataset:** `Healthcare_Coverage.csv` (loaded remotely via GitHub raw URL, filtered by `UNIT_MEASURE === 'PS'`).
- **Features:**
  - Bubble sizes scaled to the population size (in thousands) covered by government healthcare.
  - Interactive **Time Period Slider** to explore coverage changes over time.
  - Collision-free force layout with hover tooltips per country.

### 5. Domestic General Government Health Expenditure per Capita, PPP (`SpiderChart.html`)
- **Chart Type:** Multi-ring Spider / Radar Chart.
- **Dataset:** `latestGovernmentPPP.csv`
- **Features:**
  - Concentric sector rings in increments of **1,000 PPP** with a matching colour scale legend.
  - Filter by **Year** and **Region** (All Regions, North America, South America, Europe, Asia-Pacific, Middle East).
  - **Reset** button to restore defaults.
  - Hover tooltips displaying full country name, year, and PPP value.

---

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6)
- **Visualisation Libraries:**
  - D3.js (`v4` for Scatter Plot & Bubble Chart, `v5` for Spider Chart, `v7` for Map & Stacked Bar Chart)
  - `d3-scale-chromatic` & `d3-geo-projection`
  - TopoJSON Client (`topojson-client` / `topojson` v1 & v3)
  - Lodash (`v4.17.21`)
- **Hosting & CI/CD:** GitHub Pages & GitHub Actions

---

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions workflow for GitHub Pages
├── image/
│   └── image1.webp                 # Hero/About section illustration
├── Main.html                       # Main dashboard entry page
├── Main.css                        # Main dashboard layout & styling
├── Main.js                         # Scroll navbar, back-to-top, smooth scroll
│
├── Map.html                        # Chart 1: Choropleth Map
├── Map.css
├── Map.js
├── LifeExpectancyMap.csv
│
├── ScatterPlot.html                # Chart 2: Connected Scatter Plot
├── ScatterPlot.css
├── ScatterPlot.js
│
├── StackedBar.html                 # Chart 3: Stacked Bar Chart
├── StackedBar.js
├── DatasetCauseOfMortality.csv
│
├── bubble.html                     # Chart 4: Bubble Chart
├── bubble.css
├── bubble.js
│
├── SpiderChart.html                # Chart 5: Spider/Radar Chart
├── SpiderChart.js
├── latestGovernmentPPP.csv
│
├── Stackedbar&Spider.css           # Shared styling for Stacked Bar & Spider charts
└── README.md
```

---

## Running Locally

> **Important:** Because D3 loads local `.csv` files via `fetch`/`XHR` (`d3.csv()`), opening `Main.html` directly via `file://` will be blocked by browser CORS policies. An active internet connection is also required for CDN libraries and remote CSV datasets.

### Option 1: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension.
3. Right-click **`Main.html`** and select **Open with Live Server**.

### Option 2: Python HTTP Server
1. Open a terminal in the project root directory and run:
   ```bash
   python -m http.server 8000
   ```
   *(Use `python3` if required on macOS/Linux.)*
2. Open your browser and visit:
   ```text
   http://localhost:8000/Main.html
   ```

### Option 3: Node.js
```bash
npx serve .
```
Then open the local URL in your browser and navigate to `/Main.html`.

---

## Deployment (GitHub Pages)
This repository is configured to deploy automatically to GitHub Pages via `.github/workflows/deploy.yml` whenever changes are pushed to the `main` branch:
1. During deployment, `Main.html` is copied to `index.html` so the site loads directly at the root GitHub Pages URL.
2. Under **Settings → Pages → Build and deployment**, the source is set to **GitHub Actions**.

---

## Data Sources
- **Chart 1 & 2 (Life Expectancy):** [OECD Data Explorer – Life Expectancy](https://data-explorer.oecd.org/vis?fs[0]=Topic%2C1%7CHealth%23HEA%23%7CHealth%20status%23HEA_STA%23&fs[1]=Reference%20area%2C0%7CJapan%23JPN%23&fs[2]=Reference%20area%2C1%7CNon-OECD%20economies%23WXOECD%23%7CIndia%23IND%23&pg=0&snb=4&df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_HEALTH_STAT%40DF_LE&df[ag]=OECD.ELS.HD&df[vs]=1.0&dq=JPN%2BIND.A...Y0........&pd=2015%2C&to[TIME_PERIOD]=false&vw=tb)
- **Chart 3 (Causes of Mortality):** [OECD Data Explorer – Causes of Mortality](https://data-explorer.oecd.org/vis?pg=0&fs[0]=Topic%2C0%7CHealth%23HEA%23&fs[1]=Topic%2C1%7CHealth%23HEA%23%7CHealth%20status%23HEA_STA%23&fc=Topic&snb=16&vw=tb&df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_HEALTH_STAT%40DF_COM&df[ag]=OECD.ELS.HD&df[vs]=1.0&dq=USA%2BGBR%2BTUR%2BCHE%2BSWE%2BESP%2BSVN%2BPRT%2BSVK%2BPOL%2BNOR%2BNZL%2BMEX%2BNLD%2BLUX%2BLTU%2BLVA%2BKOR%2BJPN%2BITA%2BISR%2BIRL%2BISL%2BHUN%2BGRC%2BDEU%2BFRA%2BFIN%2BEST%2BDNK%2BCZE%2BCRI%2BCOL%2BCHL%2BCAN%2BBEL%2BAUT%2BAUS.A...._T.._T%2BCICDINFE%2BCICDNEOP%2BCICDSANG%2BCICDENDO%2BCICDTROU%2BCICDNERV%2BCICDREPS%2BCICDPEAU%2BCICDCIRC%2BCICDDIGE%2BCICDOSTE%2BCICDGENI%2BCICDGROS%2BCICDAFFE%2BCICDCVID%2BCICDSYMP%2BCICDCONG%2BCICDEXTC.STANDARD....&pd=2000%2C&to[TIME_PERIOD]=false)
- **Chart 4 (Healthcare Coverage):** [OECD Data Explorer – Healthcare Coverage](https://data-explorer.oecd.org/vis?fs[0]=Topic%2C1%7CHealth%23HEA%23%7CHealthcare%20coverage%23HEA_COV%23&pg=0&fc=Topic&bp=true&snb=1&vw=tb&df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_HEALTH_PROT%40DF_HEALTH_PROT&df[ag]=OECD.ELS.HD&df[vs]=1.0&dq=AUS%2BAUT%2BBEL%2BCAN%2BCHL%2BCOL%2BCRI%2BCZE%2BDNK%2BEST%2BFIN%2BFRA%2BDEU%2BGRC%2BHUN%2BISL%2BIRL%2BISR%2BITA%2BJPN%2BKOR%2BLVA%2BLTU%2BLUX%2BMEX%2BNLD%2BNZL%2BNOR%2BPOL%2BPRT%2BSVK%2BSVN%2BESP%2BSWE%2BCHE%2BTUR%2BGBR%2BUSA.A..PS.TPRIBASI%2BHCVG%2BCOVGCMED&pd=2000%2C&to[TIME_PERIOD]=false)
- **Chart 5 (Government Health Expenditure PPP):** [World Bank – Domestic General Government Health Expenditure per Capita, PPP](https://data.worldbank.org/indicator/SH.XPD.GHED.PP.CD)

---
