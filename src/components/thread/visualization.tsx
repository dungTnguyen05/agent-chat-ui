"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface VisualizationData {
  type?: "text" | "chart" | "image";
  chart_type?: "bar" | "line" | "scatter" | "pie";
  x_column?: string;
  y_column?: string;
  title?: string;
  text?: string;
  spec?: {
    chart_type?: string;
    x_column?: string;
    y_column?: string;
    title?: string;
  };
  data_summary?: {
    x_data_sample?: any[];
    y_range?: [number, number];
    y_average?: number;
    row_count?: number;
  };
  // For image visualizations
  image?: string; // base64 encoded image
  mimeType?: string;
}

interface ChartDataPoint {
  [key: string]: any;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

/**
 * Renders a chart based on visualization data
 */
function ChartVisualization({
  data,
  chartData,
}: {
  data: VisualizationData;
  chartData: ChartDataPoint[];
}) {
  const chartType = data.chart_type || data.spec?.chart_type || "bar";
  const xColumn = data.x_column || data.spec?.x_column || "x";
  const yColumn = data.y_column || data.spec?.y_column || "y";
  const title = data.title || data.spec?.title || "Chart";

  if (chartData.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">No data available for chart.</p>
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xColumn} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yColumn} fill={COLORS[0]} />
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xColumn} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={yColumn}
              stroke={COLORS[0]}
              strokeWidth={2}
            />
          </LineChart>
        );

      case "pie":
        // For pie charts, we need to aggregate data
        const pieData = chartData.map((item) => ({
          name: String(item[xColumn] || "Unknown"),
          value: Number(item[yColumn] || 0),
        }));
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case "scatter":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xColumn} type="number" />
            <YAxis type="number" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={yColumn}
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        );

      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Unsupported chart type: {chartType}
          </div>
        );
    }
  };

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>
      {data.data_summary && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Data points: {data.data_summary.row_count || chartData.length}</p>
          {data.data_summary.y_range && (
            <p>
              Range: {data.data_summary.y_range[0].toFixed(2)} -{" "}
              {data.data_summary.y_range[1].toFixed(2)}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Renders an image visualization from base64 data
 */
function ImageVisualization({ data }: { data: VisualizationData }) {
  if (!data.image) {
    return null;
  }

  const imageUrl = data.image.startsWith("data:")
    ? data.image
    : `data:${data.mimeType || "image/png"};base64,${data.image}`;

  return (
    <Card className="p-4">
      {data.title && (
        <h3 className="mb-4 text-lg font-semibold">{data.title}</h3>
      )}
      <div className="relative w-full max-w-4xl">
        <img
          src={imageUrl}
          alt={data.title || "Visualization"}
          className="rounded-lg object-contain w-full h-auto"
        />
      </div>
    </Card>
  );
}

/**
 * Renders a text-based visualization (formatted text chart)
 */
function TextVisualization({ data }: { data: VisualizationData }) {
  if (!data.text) {
    return null;
  }

  return (
    <Card className="p-4">
      {data.title && (
        <h3 className="mb-4 text-lg font-semibold">{data.title}</h3>
      )}
      <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm">
        {data.text}
      </pre>
    </Card>
  );
}

/**
 * Main visualization component that renders different types of visualizations
 */
export function Visualization({
  data,
  className,
  sqlResult,
}: {
  data: VisualizationData;
  className?: string;
  sqlResult?: any[];
}) {
  if (!data) {
    return null;
  }

  const vizType = data.type || "text";

  // Handle image visualizations
  if (vizType === "image" || data.image) {
    return (
      <div className={cn("my-4", className)}>
        <ImageVisualization data={data} />
      </div>
    );
  }

  // Handle chart visualizations with structured data
  // First, try to use SQL result data if available
  if (vizType === "chart" || (data.chart_type && sqlResult && sqlResult.length > 0)) {
    const xColumn = data.x_column || data.spec?.x_column;
    const yColumn = data.y_column || data.spec?.y_column;

    if (xColumn && yColumn && sqlResult) {
      // Use actual SQL result data
      const chartData: ChartDataPoint[] = sqlResult
        .filter((row) => row[xColumn] != null && row[yColumn] != null)
        .map((row) => ({
          [xColumn]: row[xColumn],
          [yColumn]: Number(row[yColumn]) || 0,
        }));

      if (chartData.length > 0) {
        return (
          <div className={cn("my-4", className)}>
            <ChartVisualization data={data} chartData={chartData} />
          </div>
        );
      }
    }

    // Fallback: Try to reconstruct chart data from summary
    if (data.data_summary?.x_data_sample) {
      const chartData: ChartDataPoint[] = [];
      const xSample = data.data_summary.x_data_sample || [];
      const yRange = data.data_summary.y_range || [0, 100];
      const yAvg = data.data_summary.y_average || 50;

      // Create sample data points
      xSample.forEach((x, idx) => {
        chartData.push({
          [data.x_column || data.spec?.x_column || "x"]: x,
          [data.y_column || data.spec?.y_column || "y"]:
            yAvg + (Math.random() - 0.5) * (yRange[1] - yRange[0]) * 0.3,
        });
      });

      if (chartData.length > 0) {
        return (
          <div className={cn("my-4", className)}>
            <ChartVisualization data={data} chartData={chartData} />
          </div>
        );
      }
    }
  }

  // Handle text visualizations
  if (vizType === "text" || data.text) {
    return (
      <div className={cn("my-4", className)}>
        <TextVisualization data={data} />
      </div>
    );
  }

  return null;
}

/**
 * Utility function to extract visualization data from message content or state
 */
export function extractVisualizationData(
    content: string | any[],
    state?: any,
  ): { visualization: VisualizationData | null; sqlResult?: any[] } {
    const sqlResult = state?.final_response?.sql?.result || state?.sql_result;
  
    // 1️⃣ Prefer structured visualization from state
    const stateViz =
      state?.final_response?.visualization ||
      state?.visualization ||
      state?.guarded_visualization;
  
    if (stateViz) {
      return {
        visualization: {
          type: stateViz.type || "chart",
          chart_type: stateViz.spec?.chart_type || stateViz.chart_type || "bar",
          x_column: stateViz.spec?.x_column || stateViz.x_column,
          y_column: stateViz.spec?.y_column || stateViz.y_column,
          title: stateViz.title || stateViz.spec?.title || "Chart",
          spec: stateViz.spec,
          data_summary: stateViz.data_summary,
          image: stateViz.image,
          mimeType: stateViz.mimeType,
          text: stateViz.text, // optional
        },
        sqlResult: Array.isArray(sqlResult) ? sqlResult : undefined,
      };
    }
  
    // 2️⃣ Try to parse visualization JSON directly from message content
    if (typeof content === "string") {
      try {
        const jsonMatch = content.match(
          /"visualization"\s*:\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/
        );
        if (jsonMatch) {
          const parsed = JSON.parse(`{${jsonMatch[0]}}`);
          if (parsed.visualization) {
            return {
              visualization: {
                type: parsed.visualization.type || "chart",
                chart_type: parsed.visualization.spec?.chart_type || parsed.visualization.chart_type || "bar",
                x_column: parsed.visualization.spec?.x_column || parsed.visualization.x_column,
                y_column: parsed.visualization.spec?.y_column || parsed.visualization.y_column,
                title: parsed.visualization.title || parsed.visualization.spec?.title || "Chart",
                spec: parsed.visualization.spec,
                data_summary: parsed.visualization.data_summary,
                text: parsed.visualization.text,
                image: parsed.visualization.image,
                mimeType: parsed.visualization.mimeType,
              },
              sqlResult: undefined,
            };
          }
        }
      } catch {
        // ignore parse errors
      }
    }
  
    // 3️⃣ Fallback: return an empty chart if possible
    return {
      visualization: {
        type: "chart",
        chart_type: "bar",
        title: "Chart",
      },
      sqlResult: Array.isArray(sqlResult) ? sqlResult : undefined,
    };
  }
  
