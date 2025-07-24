import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SimpleChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Simple test data
    const data = [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
      { x: 3, y: 15 },
      { x: 4, y: 25 },
      { x: 5, y: 30 }
    ];

    const width = 400;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 30 };

    const xScale = d3.scaleLinear()
      .domain([0, 6])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 35])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<typeof data[0]>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    // Add the line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 3)
      .attr('fill', 'steelblue');

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    console.log('Simple chart rendered successfully');
  }, []);

  return (
    <div>
      <h4>Test Chart</h4>
      <svg ref={svgRef} width="400" height="200" style={{ border: '1px solid #ccc' }} />
    </div>
  );
};

export default SimpleChart;