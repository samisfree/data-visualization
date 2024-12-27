import * as d3 from 'd3';

// Base interface for common properties
interface BaseChartData {
  name?: string;
}

// Line chart specific data
export interface LineChartData extends BaseChartData {
  [key: string]: string | number | null | undefined;
}

// Entity graph specific data
export interface EntityGraphData {
  source: string;
  target: string;
}

// Container dimensions interface
export interface ContainerDimensions {
  width: number;
  height: number;
}

// Chart data type for state management
export type ChartDataType = {
  type: 'line' | 'entity';
  data: LineChartData[] | EntityGraphData[];
};

// Union type for all chart data
export type ChartData = LineChartData | EntityGraphData;

// Extend Window interface
declare global {
  interface Window {
    d3: typeof d3;
    D3_VERSION?: string;
    __GRAPH_DATA__?: ChartData[];
    __testLogs?: string[];
    Playwright?: boolean;
  }
}

export {};
