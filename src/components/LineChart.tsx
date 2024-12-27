import React, { useEffect, useRef, useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface LineChartProps {
  data: Array<{
    Year: string;
    Category: string;
    Value: number;
    [key: string]: string | number;
  }>;
  selectedColors: string[];
  numericalColumns: string[];
}

const logForTest = (message: string): void => {
  console.log(`[Chart Log] ${message}`);
  if (typeof window !== 'undefined') {
    (window as any).__testLogs = (window as any).__testLogs || [];
    (window as any).__testLogs.push(message);
  }
};

export const LineChart: React.FC<LineChartProps> = ({ data, numericalColumns, selectedColors }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('=== LineChart Component Update ===');
    console.log('Received data:', JSON.stringify(data, null, 2));
    console.log('Numerical columns (categories):', numericalColumns);
    console.log('Selected colors:', selectedColors);

    if (!data || data.length === 0) {
      console.log('No data available');
      return;
    }

    // Log the structure of the first data point
    console.log('First data point structure:', Object.keys(data[0]));
    console.log('Categories to be used as lines:', numericalColumns);

    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const dimensionsMatch = width === containerDimensions.width && height === containerDimensions.height;

        if (!dimensionsMatch) {
          setContainerDimensions({ width, height });
          logForTest(`Container dimensions updated: ${width}x${height}`);
        }
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(updateDimensions, 100);
    });

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [containerDimensions, data, numericalColumns, selectedColors]);

  if (!data || data.length === 0) {
    logForTest('No data available for chart');
    return <div>No data available</div>;
  }

  // Log the data structure for debugging
  logForTest(`Data structure: ${JSON.stringify(data[0], null, 2)}`);
  logForTest(`Categories used: ${numericalColumns.join(', ')}`);

  // Get unique categories from data
  const categories = [...new Set(data.map(item => item.Category))];
  logForTest(`Available categories: ${categories.join(', ')}`);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
      className="line-chart-container"
    >
      {containerDimensions.width > 0 && containerDimensions.height > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="Year"
              label={{ value: '年份', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{
                value: '数值',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
              }}
            />
            <Tooltip />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => {
                // Use the category name directly from the data
                const category = categories.find(cat => cat === value);
                logForTest(`Legend formatter: value=${value}, category=${category}`);
                return category || value;
              }}
            />
            {categories.map((category, index) => {
              logForTest(`Creating line for category: ${category}`);
              return (
                <Line
                  key={category}
                  type="monotone"
                  dataKey="Value"
                  name={category}
                  data={data.filter(item => item.Category === category)}
                  stroke={selectedColors[index % selectedColors.length]}
                  dot={{ fill: selectedColors[index % selectedColors.length], r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              );
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineChart;
