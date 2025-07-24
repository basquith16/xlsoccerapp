import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { generateCustomerData, generateCustomerSegmentation, generateCohortData, CustomerDataPoint } from './demoData';
import Card from '../../ui/Card';

const CustomerAnalytics: React.FC = () => {
  const customerGrowthRef = useRef<SVGSVGElement>(null);
  const segmentationRef = useRef<SVGSVGElement>(null);
  const cohortRef = useRef<SVGSVGElement>(null);
  const { isDemoMode } = useDemoMode();
  const [customerData, setCustomerData] = useState<CustomerDataPoint[]>([]);
  const [segmentationData, setSegmentationData] = useState(generateCustomerSegmentation());
  const [cohortData, setCohortData] = useState(generateCohortData());

  useEffect(() => {
    if (isDemoMode) {
      setCustomerData(generateCustomerData(30));
      setSegmentationData(generateCustomerSegmentation());
      setCohortData(generateCohortData());
    } else {
      // TODO: Fetch real data
      setCustomerData(generateCustomerData(30).map(d => ({
        ...d,
        newCustomers: Math.round(d.newCustomers * 0.7),
        totalActive: Math.round(d.totalActive * 0.8),
      })));
    }
  }, [isDemoMode]);

  // Customer Growth Chart
  useEffect(() => {
    if (!customerData.length || !customerGrowthRef.current) {
      console.log('Customer chart: Missing data or ref', { dataLength: customerData.length, hasRef: !!customerGrowthRef.current });
      return;
    }

    try {
      const svg = d3.select(customerGrowthRef.current);
      svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
      .domain(d3.extent(customerData, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(customerData, d => d.totalActive) as number])
      .nice()
      .range([height, 0]);

    const line = d3.line<CustomerDataPoint>()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.totalActive))
      .curve(d3.curveMonotoneX);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add area
    const area = d3.area<CustomerDataPoint>()
      .x(d => xScale(new Date(d.date)))
      .y0(height)
      .y1(d => yScale(d.totalActive))
      .curve(d3.curveMonotoneX);

    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'customerGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', height);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.6);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.1);

    g.append('path')
      .datum(customerData)
      .attr('fill', 'url(#customerGradient)')
      .attr('d', area);

    g.append('path')
      .datum(customerData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d') as any));

    g.append('g')
      .call(d3.axisLeft(yScale));

    } catch (error) {
      console.error('Error rendering customer growth chart:', error);
    }
  }, [customerData]);

  // Customer Segmentation Pie Chart
  useEffect(() => {
    if (!segmentationRef.current) return;

    const svg = d3.select(segmentationRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<any>()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(segmentationData))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .text(d => d.data.segment);

  }, [segmentationData]);

  // Cohort Analysis Heatmap
  useEffect(() => {
    if (!cohortRef.current) return;

    const svg = d3.select(cohortRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 60 };
    const cellSize = 40;
    const width = cohortData[0]?.data.length * cellSize + margin.left + margin.right || 400;
    const height = cohortData.length * cellSize + margin.top + margin.bottom;

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, 100]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    cohortData.forEach((cohort, i) => {
      cohort.data.forEach((value, j) => {
        g.append('rect')
          .attr('x', j * cellSize)
          .attr('y', i * cellSize)
          .attr('width', cellSize - 1)
          .attr('height', cellSize - 1)
          .attr('fill', colorScale(value))
          .attr('stroke', 'white');

        g.append('text')
          .attr('x', j * cellSize + cellSize / 2)
          .attr('y', i * cellSize + cellSize / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '10px')
          .attr('fill', value > 50 ? 'white' : 'black')
          .text(`${value}%`);
      });

      // Add month labels
      g.append('text')
        .attr('x', -10)
        .attr('y', i * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .text(cohort.month);
    });

    // Add period labels
    const periods = ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'];
    periods.slice(0, cohortData[0]?.data.length).forEach((period, i) => {
      g.append('text')
        .attr('x', i * cellSize + cellSize / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(period);
    });

  }, [cohortData]);

  const totalCustomers = customerData[customerData.length - 1]?.totalActive || 0;
  const newCustomersThisMonth = customerData.slice(-30).reduce((sum, d) => sum + d.newCustomers, 0);
  const churnedCustomersThisMonth = customerData.slice(-30).reduce((sum, d) => sum + d.churned, 0);
  const retentionRate = totalCustomers > 0 ? Math.round(((totalCustomers - churnedCustomersThisMonth) / totalCustomers) * 100) : 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalCustomers.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Active</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{newCustomersThisMonth}</div>
          <div className="text-sm text-gray-600">New This Month</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">{churnedCustomersThisMonth}</div>
          <div className="text-sm text-gray-600">Churned This Month</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{retentionRate}%</div>
          <div className="text-sm text-gray-600">Retention Rate</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth */}
        <Card>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Customer Growth (30 days)</h4>
          <svg ref={customerGrowthRef} width="600" height="300" />
        </Card>

        {/* Customer Segmentation */}
        <Card>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Customer Segmentation</h4>
          <div className="flex flex-col items-center">
            <svg ref={segmentationRef} width="400" height="300" />
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              {segmentationData.map((segment, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span>{segment.segment}: {segment.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Cohort Analysis */}
      <Card>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Cohort Retention Analysis</h4>
        <p className="text-sm text-gray-600 mb-4">
          Percentage of customers retained over time by signup month
        </p>
        <div className="overflow-x-auto">
          <svg ref={cohortRef} width="500" height="300" />
        </div>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;