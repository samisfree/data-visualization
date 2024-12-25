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

  // Process each row
  data.forEach(row => {
    const rowNodes: string[] = [];

    // Process each column
    Object.entries(row).forEach(([column, value], columnIndex) => {
      const strValue = String(value);

      // Add node if not exists (deduplication)
      if (!nodes.has(strValue)) {
        nodes.set(strValue, {
          id: strValue,
          color: selectedColors[columnIndex % selectedColors.length],
          column
        });
      }

      rowNodes.push(strValue);
    });

    // Create edges between nodes in same row
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
