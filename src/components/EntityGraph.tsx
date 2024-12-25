import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { processExcelData, calculateCircleLayout } from '../utils/graphUtils';

interface EntityGraphProps {
  data: {
    [key: string]: string | number;
  }[];
  selectedColors: string[];
}

export function EntityGraph({ data, selectedColors }: EntityGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Process data and calculate layout
    const { nodes, edges } = processExcelData(data, selectedColors);
    const nodesWithPositions = calculateCircleLayout(nodes);

    // Setup SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create a group for centering the visualization
    const g = svg.append('g')
      .attr('transform', 'translate(430, 243.5)'); // Center of 860x487

    // Draw edges first (so they're behind nodes)
    g.selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('x1', d => nodesWithPositions.find(n => n.id === d.source)?.x || 0)
      .attr('y1', d => nodesWithPositions.find(n => n.id === d.source)?.y || 0)
      .attr('x2', d => nodesWithPositions.find(n => n.id === d.target)?.x || 0)
      .attr('y2', d => nodesWithPositions.find(n => n.id === d.target)?.y || 0)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // Create groups for nodes
    const nodeGroups = g.selectAll('g.node')
      .data(nodesWithPositions)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add circles for nodes
    nodeGroups.append('circle')
      .attr('r', 25)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add text labels
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', '#000')
      .attr('font-size', '12px')
      .text(d => d.id);

    // Add hover effects
    nodeGroups
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', function(d: any) {
            return `translate(${d.x},${d.y}) scale(1.1)`;
          });
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', function(d: any) {
            return `translate(${d.x},${d.y}) scale(1)`;
          });
      });

  }, [data, selectedColors]);

  return (
    <svg
      ref={svgRef}
      width="860"
      height="487"
      className="mx-auto"
      style={{
        backgroundColor: 'white',
        borderRadius: '0.375rem', // equivalent to Tailwind's rounded
      }}
    />
  );
}
