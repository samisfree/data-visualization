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
  const firstOccurrenceColumn = new Map<string, string>(); // Track first occurrence column

  // Helper function to check if a value is numerical
  const isNumerical = (value: any): boolean => {
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
      const num = Number(value);
      return !isNaN(num);
    }
    return false;
  };

  // First pass: collect all non-numerical values and their first occurrence columns
  data.forEach(row => {
    Object.entries(row).forEach(([column, value]) => {
      if (!isNumerical(value) && value !== null && value !== undefined && value !== '') {
        const strValue = String(value).trim();
        if (strValue && !firstOccurrenceColumn.has(strValue)) {
          firstOccurrenceColumn.set(strValue, column);
        }
      }
    });
  });

  // Second pass: create nodes and edges
  data.forEach(row => {
    const rowNodes: string[] = [];

    // Process each column
    Object.entries(row).forEach(([column, value]) => {
      if (!isNumerical(value) && value !== null && value !== undefined && value !== '') {
        const strValue = String(value).trim();

        if (strValue && !nodes.has(strValue)) {
          const firstColumn = firstOccurrenceColumn.get(strValue) || column;
          const columnIndex = Array.from(firstOccurrenceColumn.values()).indexOf(firstColumn);

          nodes.set(strValue, {
            id: strValue,
            color: selectedColors[columnIndex % selectedColors.length],
            column: firstColumn
          });
        }

        if (strValue) {
          rowNodes.push(strValue);
        }
      }
    });

    // Create edges between non-numerical nodes in same row
    for (let i = 0; i < rowNodes.length; i++) {
      for (let j = i + 1; j < rowNodes.length; j++) {
        edges.push({
          source: rowNodes[i],
          target: rowNodes[j]
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
