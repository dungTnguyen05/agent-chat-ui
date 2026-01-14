# Visualization Implementation Guide

This document explains how visualization rendering has been implemented in the agent-chat-ui repository.

## Overview

The UI now supports rendering visualizations (charts and images) from the LangGraph agent. The implementation includes:

1. **Visualization Component** (`src/components/thread/visualization.tsx`)
   - Renders bar charts, line charts, pie charts, and scatter plots using Recharts
   - Supports image visualizations from base64 data
   - Supports text-based visualizations (formatted ASCII charts)

2. **Integration with Assistant Messages** (`src/components/thread/messages/ai.tsx`)
   - Automatically detects and renders visualizations from agent responses
   - Extracts visualization data from state or message content

## How It Works

### Data Flow

1. The Python agent generates visualization data and stores it in `state["visualization"]` and `state["final_response"]["visualization"]`
2. The UI extracts visualization data from:
   - State values (`thread.values` or `meta?.firstSeenState?.values`)
   - Message content (if embedded as JSON)
3. The visualization component renders the appropriate chart or image

### Visualization Data Structure

The agent should provide visualization data in the following format:

```typescript
{
  type?: "text" | "chart" | "image",
  chart_type?: "bar" | "line" | "scatter" | "pie",
  x_column?: string,
  y_column?: string,
  title?: string,
  text?: string,  // For text visualizations
  spec?: {
    chart_type?: string,
    x_column?: string,
    y_column?: string,
    title?: string
  },
  data_summary?: {
    x_data_sample?: any[],
    y_range?: [number, number],
    y_average?: number,
    row_count?: number
  },
  image?: string,  // base64 encoded image
  mimeType?: string
}
```

### Supported Chart Types

- **Bar Chart**: For categorical data comparisons
- **Line Chart**: For time series or continuous data
- **Pie Chart**: For proportional data
- **Scatter Plot**: For correlation analysis

### Image Support

The component supports base64-encoded images:
- PNG, JPEG, GIF, SVG formats
- Images can be embedded directly in the visualization data

## Python Agent Integration

To ensure visualizations render correctly, your Python agent should:

1. **Store visualization in state**:
   ```python
   state["visualization"] = {
       "type": "chart",
       "chart_type": "bar",
       "x_column": "category",
       "y_column": "value",
       "title": "Sales by Category",
       "spec": {...},
       "data_summary": {...}
   }
   ```

2. **Include in final_response**:
   ```python
   state["final_response"] = {
       "answer": "...",
       "visualization": state["visualization"],
       "sql": {...}
   }
   ```

3. **For images**, include base64 data:
   ```python
   state["visualization"] = {
       "type": "image",
       "image": base64_encoded_string,
       "mimeType": "image/png",
       "title": "Chart Image"
   }
   ```

## Features

- ✅ Automatic detection of visualization data
- ✅ Support for multiple chart types (bar, line, pie, scatter)
- ✅ Image rendering from base64 data
- ✅ Text visualization rendering (formatted ASCII charts)
- ✅ Integration with SQL result data
- ✅ Responsive design with proper styling
- ✅ Fallback handling for missing data

## Usage

The visualization component is automatically integrated into the message rendering pipeline. No additional configuration is needed - visualizations will appear automatically when the agent includes visualization data in its response.

## Future Enhancements

Potential improvements:
- Support for more chart types (area, radar, etc.)
- Interactive chart features (zoom, pan)
- Export functionality (download as PNG/PDF)
- Custom color schemes
- Multi-series charts
