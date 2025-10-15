//load the dataset and create visualizations
Promise.all([
    fetch('dataset/videogames_wide.csv').then(response => response.text()),
    fetch('dataset/videogames_long.csv').then(response => response.text())
]).then(([wideData, longData]) => {
    // Robust CSV parser that handles quoted fields
    const parseCSV = (csv) => {
        const lines = csv.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        if (lines.length === 0) return [];
        
        // Parse headers
        const headers = parseCSVLine(lines[0]);
        
        return lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const obj = {};
            headers.forEach((header, i) => {
                let value = values[i] || '';
                // Convert numeric fields
                if (['Year', 'Global_Sales', 'NA_Sales', 'EU_Sales', 'JP_Sales', 'Other_Sales'].includes(header)) {
                    value = value ? parseFloat(value) : 0;
                }
                obj[header] = value;
            });
            return obj;
        }).filter(row => row.Name && row.Name !== '' && row.Platform && row.Platform !== '');
    };

    // Helper function to parse CSV line with quoted fields
    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        // Add the last field
        result.push(current.trim());
        return result;
    };

    const wideDataParsed = parseCSV(wideData);
    const longDataParsed = parseCSV(longData);

    // Visualization 1: Global Sales by Genre and Platform
    const vis1Spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Average global sales by genre and platform",
        "data": {
            "values": wideDataParsed
        },
        "transform": [
            {
                "aggregate": [{
                    "op": "mean",
                    "field": "Global_Sales",
                    "as": "Avg_Global_Sales"
                }],
                "groupby": ["Genre", "Platform"]
            },
            {
                "filter": "datum.Avg_Global_Sales > 0.1" // Filter out very low averages
            }
        ],
        "mark": "circle",
        "encoding": {
            "x": {
                "field": "Platform",
                "type": "nominal",
                "title": "Platform",
                "axis": {"labelAngle": -45}
            },
            "y": {
                "field": "Genre",
                "type": "nominal",
                "title": "Genre"
            },
            "size": {
                "field": "Avg_Global_Sales",
                "type": "quantitative",
                "title": "Avg Global Sales (M)",
                "scale": {"range": [50, 500]}
            },
            "color": {
                "field": "Avg_Global_Sales",
                "type": "quantitative",
                "title": "Avg Global Sales (M)",
                "scale": {"scheme": "viridis"}
            },
            "tooltip": [
                {"field": "Platform", "type": "nominal", "title": "Platform"},
                {"field": "Genre", "type": "nominal", "title": "Genre"},
                {"field": "Avg_Global_Sales", "type": "quantitative", "title": "Avg Global Sales (M)", "format": ".2f"}
            ]
        },
        "width": 600,
        "height": 400
    };

    // Visualization 2: Sales Over Time by Platform and Genre
    const vis2Spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Sales trends over time by platform",
        "data": {
            "values": wideDataParsed
        },
        "transform": [
            {
                "filter": "datum.Year >= 1980 && datum.Year <= 2016"
            },
            {
                "aggregate": [{
                    "op": "sum",
                    "field": "Global_Sales",
                    "as": "Total_Global_Sales"
                }],
                "groupby": ["Year", "Platform"]
            },
            {
                "window": [{
                    "op": "sum",
                    "field": "Total_Global_Sales",
                    "as": "Cumulative_Sales"
                }],
                "groupby": ["Platform"],
                "sort": [{"field": "Year"}],
                "frame": [null, 0]
            }
        ],
        "layer": [
            {
                "mark": "line",
                "encoding": {
                    "x": {
                        "field": "Year",
                        "type": "temporal",
                        "title": "Year"
                    },
                    "y": {
                        "field": "Cumulative_Sales",
                        "type": "quantitative",
                        "title": "Cumulative Global Sales (M)"
                    },
                    "color": {
                        "field": "Platform",
                        "type": "nominal",
                        "title": "Platform"
                    },
                    "tooltip": [
                        {"field": "Year", "type": "temporal", "title": "Year"},
                        {"field": "Platform", "type": "nominal", "title": "Platform"},
                        {"field": "Cumulative_Sales", "type": "quantitative", "title": "Cumulative Sales (M)", "format": ".2f"}
                    ]
                }
            }
        ],
        "width": 600,
        "height": 400
    };

    const vis3Spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Regional sales by platform - Stacked",
    "data": {
        "values": wideDataParsed
    },
    "transform": [
        // Aggregate by platform first
        {
            "aggregate": [
                {"op": "mean", "field": "NA_Sales", "as": "North America"},
                {"op": "mean", "field": "EU_Sales", "as": "Europe"},
                {"op": "mean", "field": "JP_Sales", "as": "Japan"},
                {"op": "mean", "field": "Other_Sales", "as": "Other Regions"}
            ],
            "groupby": ["Platform"]
        },
        // Fold into long format
        {
            "fold": ["North America", "Europe", "Japan", "Other Regions"],
            "as": ["Region", "Sales"]
        },
        // Calculate total sales per platform for ordering
        {
            "window": [{
                "op": "sum",
                "field": "Sales",
                "as": "Total_Sales"
            }],
            "groupby": ["Platform"]
        },
        // Filter to platforms with significant sales
        {
            "filter": "datum.Total_Sales > 0.5"
        },
        // Limit to top platforms to avoid clutter
        {
            "window": [{
                "op": "rank",
                "as": "platform_rank"
            }],
            "sort": [{"field": "Total_Sales", "order": "descending"}]
        },
        {
            "filter": "datum.platform_rank <= 15" // Show top 15 platforms
        }
    ],
    "mark": "bar",
    "encoding": {
        "x": {
            "field": "Platform",
            "type": "nominal",
            "title": "Platform",
            "axis": {"labelAngle": -45},
            "sort": {"field": "Total_Sales", "order": "descending"} // This orders highest to lowest
        },
        "y": {
            "field": "Sales",
            "type": "quantitative",
            "title": "Average Sales (M)",
            "stack": true
        },
        "color": {
            "field": "Region",
            "type": "nominal",
            "title": "Region",
            "scale": {
                "domain": ["North America", "Europe", "Japan", "Other Regions"],
                "range": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]
            }
        },
        "tooltip": [
            {"field": "Platform", "type": "nominal", "title": "Platform"},
            {"field": "Region", "type": "nominal", "title": "Region"},
            {"field": "Sales", "type": "quantitative", "title": "Avg Sales (M)", "format": ".2f"},
            {"field": "Total_Sales", "type": "quantitative", "title": "Total Avg Sales (M)", "format": ".2f"}
        ]
    },
    "width": 600,
    "height": 400
};

    // Visualization 4: Publisher Performance Analysis
    const vis4Spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Publisher performance across regions and genres",
        "data": {
            "values": wideDataParsed
        },
        "transform": [
            {
                "filter": "datum.Publisher && (datum.Publisher == 'Nintendo' || datum.Publisher == 'Electronic Arts' || datum.Publisher == 'Activision' || datum.Publisher == 'Sony Computer Entertainment' || datum.Publisher == 'Ubisoft' || datum.Publisher == 'Take-Two Interactive' || datum.Publisher == 'THQ' || datum.Publisher == 'Konami Digital Entertainment' || datum.Publisher == 'Sega' || datum.Publisher == 'Namco Bandai Games')"
            },
            {
                "aggregate": [{
                    "op": "mean",
                    "field": "Global_Sales",
                    "as": "Avg_Global_Sales"
                }],
                "groupby": ["Publisher", "Genre"]
            },
            {
                "window": [{
                    "op": "rank",
                    "as": "rank"
                }],
                "sort": [{"field": "Avg_Global_Sales", "order": "descending"}],
                "groupby": ["Publisher"]
            },
            {
                "filter": "datum.rank <= 5" // Top 5 genres per publisher
            }
        ],
        "mark": "bar",
        "encoding": {
            "x": {
                "field": "Avg_Global_Sales",
                "type": "quantitative",
                "title": "Average Global Sales (M)"
            },
            "y": {
                "field": "Genre",
                "type": "nominal",
                "title": "Genre"
            },
            "color": {
                "field": "Publisher",
                "type": "nominal",
                "title": "Publisher"
            },
            "column": {
                "field": "Publisher",
                "type": "nominal",
                "title": "",
                "header": {"labelAngle": -45, "labelAlign": "right"}
            },
            "tooltip": [
                {"field": "Publisher", "type": "nominal", "title": "Publisher"},
                {"field": "Genre", "type": "nominal", "title": "Genre"},
                {"field": "Avg_Global_Sales", "type": "quantitative", "title": "Avg Global Sales (M)", "format": ".2f"}
            ]
        },
        "width": 120,
        "height": 200
    };

    // Embed the visualizations
    vegaEmbed('#vis1', vis1Spec);
    vegaEmbed('#vis2', vis2Spec);
    vegaEmbed('#vis3', vis3Spec);
    vegaEmbed('#vis4', vis4Spec);
}).catch(error => {
    console.error('Error loading data:', error);
    document.querySelectorAll('.svg-container').forEach(container => {
        container.innerHTML = '<p>Error loading visualization data. Please check if the CSV files are available.</p>';
    });
});