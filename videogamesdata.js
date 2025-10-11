// Load the dataset and create visualizations
Promise.all([
    fetch('dataset/videogames_wide.csv').then(response => response.text()),
    fetch('dataset/videogames_long.csv').then(response => response.text())
]).then(([wideData, longData]) => {
    // Parse CSV data
    const parseCSV = (csv) => {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, i) => {
                obj[header.trim()] = values[i] ? values[i].trim() : '';
            });
            return obj;
        }).filter(row => row.Name); // Filter out empty rows
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

    // Visualization 3: Regional Sales vs. Platform
    const vis3Spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Regional sales by platform",
        "data": {
            "values": wideDataParsed
        },
        "transform": [
            {
                "fold": ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"],
                "as": ["Region", "Sales"]
            },
            {
                "aggregate": [{
                    "op": "mean",
                    "field": "Sales",
                    "as": "Avg_Regional_Sales"
                }],
                "groupby": ["Platform", "Region"]
            },
            {
                "calculate": "if(datum.Region == 'NA_Sales', 'North America', if(datum.Region == 'EU_Sales', 'Europe', if(datum.Region == 'JP_Sales', 'Japan', 'Other Regions')))",
                "as": "Region_Name"
            }
        ],
        "mark": "bar",
        "encoding": {
            "x": {
                "field": "Platform",
                "type": "nominal",
                "title": "Platform",
                "axis": {"labelAngle": -45}
            },
            "y": {
                "field": "Avg_Regional_Sales",
                "type": "quantitative",
                "title": "Average Regional Sales (M)"
            },
            "color": {
                "field": "Region_Name",
                "type": "nominal",
                "title": "Region"
            },
            "column": {
                "field": "Region_Name",
                "type": "nominal",
                "title": ""
            },
            "tooltip": [
                {"field": "Platform", "type": "nominal", "title": "Platform"},
                {"field": "Region_Name", "type": "nominal", "title": "Region"},
                {"field": "Avg_Regional_Sales", "type": "quantitative", "title": "Avg Sales (M)", "format": ".2f"}
            ]
        },
        "width": 150,
        "height": 300
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