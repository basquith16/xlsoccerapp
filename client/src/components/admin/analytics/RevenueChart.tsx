import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { generateRevenueData, generateMonthlyComparison, RevenueDataPoint } from './demoData';
import Card from '../../ui/Card';

const RevenueChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isDemoMode } = useDemoMode();
  const [timeRange, setTimeRange] = useState('30');
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState(generateMonthlyComparison());

  // Generate or fetch data based on demo mode
  useEffect(() => {
    if (isDemoMode) {
      setData(generateRevenueData(parseInt(timeRange)));
      setMonthlyData(generateMonthlyComparison());
    } else {
      // TODO: Fetch real data from API
      setData(generateRevenueData(parseInt(timeRange)).map(d => ({
        ...d,
        revenue: Math.round(d.revenue * 0.7), // Simulate lower real revenue
        sessions: Math.round(d.sessions * 0.8),
        customers: Math.round(d.customers * 0.75),
      })));
    }
  }, [isDemoMode, timeRange]);

  // D3.js chart rendering
  useEffect(() => {
    if (!data.length || !svgRef.current) {
      console.log('Revenue chart: Missing data or ref', { dataLength: data.length, hasRef: !!svgRef.current });
      return;
    }

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear previous chart

      const margin = { top: 20, right: 30, bottom: 40, left: 70 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.revenue) as number])
      .nice()
      .range([height, 0]);

    // Create line generator
    const line = d3.line<RevenueDataPoint>()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.revenue))
      .curve(d3.curveMonotoneX);

    // Create area generator for gradient fill
    const area = d3.area<RevenueDataPoint>()
      .x(d => xScale(new Date(d.date)))
      .y0(height)
      .y1(d => yScale(d.revenue))
      .curve(d3.curveMonotoneX);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add gradient definition
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'revenueGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', height);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.6);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.1);

    // Add area
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#revenueGradient)')
      .attr('d', area);

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(new Date(d.date)))
      .attr('cy', d => yScale(d.revenue))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .on('mouseover', function(event, d) {
        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <div>Date: ${new Date(d.date).toLocaleDateString()}</div>
          <div>Revenue: $${d.revenue.toLocaleString()}</div>
          <div>Sessions: ${d.sessions}</div>
          <div>Customers: ${d.customers}</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.selectAll('.tooltip').remove();
      });

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%m/%d') as any)
        .ticks(6));

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `$${(d as number).toLocaleString()}`));

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Revenue ($)');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Date');

    } catch (error) {
      console.error('Error rendering revenue chart:', error);
    }
  }, [data]);

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgDailyRevenue = data.length > 0 ? Math.round(totalRevenue / data.length) : 0;
  const maxDailyRevenue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">${avgDailyRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Daily Average</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">${maxDailyRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Best Day</div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <div className="w-full overflow-x-auto">
          <svg
            ref={svgRef}
            width="800"
            height="400"
            className="min-w-full"
            style={{ border: '1px solid #e5e7eb' }}
          />
          <div className="text-sm text-gray-500 mt-2">
            Data points: {data.length}, Demo mode: {isDemoMode ? 'Yes' : 'No'}
          </div>
        </div>
      </Card>

      {/* Monthly Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h4 className="text-md font-semibold text-gray-900 mb-4">This Month</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold">${monthlyData.current.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customers</span>
              <span className="font-semibold">{monthlyData.current.customers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sessions</span>
              <span className="font-semibold">{monthlyData.current.sessions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Value</span>
              <span className="font-semibold">${monthlyData.current.avgValue}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Last Month</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold">${monthlyData.previous.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customers</span>
              <span className="font-semibold">{monthlyData.previous.customers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sessions</span>
              <span className="font-semibold">{monthlyData.previous.sessions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Value</span>
              <span className="font-semibold">${monthlyData.previous.avgValue}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RevenueChart;