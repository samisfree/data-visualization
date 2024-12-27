interface Node {
  id: string;
  color: string;
  column: string;
}

interface Edge {
  source: string;
  target: string;
}

interface ProcessedGraphData {
  nodes: Node[];
  edges: Edge[];
}

export function processExcelData(data: any[], selectedColors: string[]): ProcessedGraphData {
  const nodes = new Map<string, Node>();
  const edges: Edge[] = [];
  const firstOccurrenceColumn = new Map<string, string>();
  const categoricalColumns = new Set<string>();

  // Helper function to check if a value is numerical
  const isNumerical = (value: any): boolean => {
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
      const num = Number(value);
      return !isNaN(num);
    }
    return false;
  };

  // First pass: identify categorical columns
  if (data.length > 0) {
    Object.entries(data[0]).forEach(([column]) => {
      // Check if column contains mostly non-numerical values
      const nonNumericalCount = data.filter(row => !isNumerical(row[column])).length;
      if (nonNumericalCount > data.length * 0.5) {
        categoricalColumns.add(column);
      }
    });
  }

  // Second pass: collect all categorical values and their first occurrence columns
  data.forEach(row => {
    Object.entries(row).forEach(([column, value]) => {
      if (categoricalColumns.has(column) && value !== null && value !== undefined && value !== '') {
        const strValue = String(value).trim();
        if (strValue && !firstOccurrenceColumn.has(strValue)) {
          firstOccurrenceColumn.set(strValue, column);
        }
      }
    });
  });

  // Third pass: create nodes and edges
  data.forEach(row => {
    const rowCategories = new Map<string, string>(); // column -> value

    // Collect categorical values for this row
    Object.entries(row).forEach(([column, value]) => {
      if (categoricalColumns.has(column) && value !== null && value !== undefined && value !== '') {
        const strValue = String(value).trim();
        if (strValue) {
          rowCategories.set(column, strValue);

          if (!nodes.has(strValue)) {
            const columnIndex = Array.from(categoricalColumns).indexOf(column);
            nodes.set(strValue, {
              id: strValue,
              color: selectedColors[columnIndex % selectedColors.length],
              column
            });
          }
        }
      }
    });

    // Create edges between categorical values
    const categories = Array.from(rowCategories.entries());
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        edges.push({
          source: categories[i][1],
          target: categories[j][1]
        });
      }
    }
  });

  return {
    nodes: Array.from(nodes.values()),
    edges
  };
}

interface PositionedNode extends Node {
  x: number;
  y: number;
}

export function calculateCircleLayout(nodes: Node[], radius: number = 200): PositionedNode[] {
  const angleStep = (2 * Math.PI) / nodes.length;
  return nodes.map((node, i) => ({
    ...node,
    x: radius * Math.cos(i * angleStep),
    y: radius * Math.sin(i * angleStep)
  }));
}
