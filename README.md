# Power BI-style Dashboard

A dynamic, interactive dashboard application similar to Power BI, built with modern web technologies.

## Features

- 📊 Drag-and-drop, resizable widget grid
- 📁 CSV import & preview
- 📈 Dynamic charts (line, bar, pie) driven by CSV data
- 🔍 Filtering controls
- 💾 Save/load dashboard layouts

## Tech Stack

- Vite + React (TypeScript)
- Tailwind CSS
- shadcn/ui
- react-grid-layout (for drag-and-drop dashboard)
- PapaParse (for CSV parsing)
- Recharts (for data visualization)
- Zustand (for state management)

## Project Structure

```
/src
  /assets           → static icons, images
  /components       → dumb UI pieces
  /features
    /charts         → LineChartWidget, BarChartWidget, PieChartWidget
    /data           → CSVImporter, DataTablePreview
    /dashboard      → DashboardGrid, WidgetContainer
  /hooks            → useCSVParser
  /layouts          → MainLayout
  /pages            → DashboardPage, ImportPage, SettingsPage
  /services         → dataService, storageService
  /store            → dashboardStore, dataStore
  /utils            → utility functions
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/power-bi-dashboard.git
   cd power-bi-dashboard
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

1. **Import Data**: Navigate to "Data Sources" and upload a CSV file.

2. **Create Widgets**: On the Dashboard, click "Add Widget" and select a chart type.

3. **Configure Widgets**: Choose a data source and configure visualization settings.

4. **Arrange Widgets**: Use drag-and-drop to arrange widgets and resize them as needed.

5. **Save Dashboard**: Export your dashboard configuration for later use.

## License

MIT
