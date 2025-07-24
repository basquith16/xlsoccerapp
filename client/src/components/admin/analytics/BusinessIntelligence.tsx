import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { generateForecastData } from './demoData';
import Card from '../../ui/Card';

const BusinessIntelligence: React.FC = () => {
  const forecastRef = useRef<SVGSVGElement>(null);
  const { isDemoMode } = useDemoMode();
  const [forecastData, setForecastData] = useState(generateForecastData());
  const [kpiTargets] = useState({
    revenue: { target: 35000, current: isDemoMode ? 28920 : 21000 },
    customers: { target: 1000, current: isDemoMode ? 892 : 650 },
    retention: { target: 85, current: isDemoMode ? 82 : 79 },
    avgValue: { target: 50, current: isDemoMode ? 41.80 : 38.50 }
  });

  useEffect(() => {
    if (isDemoMode) {
      setForecastData(generateForecastData());
    } else {
      // TODO: Fetch real forecast data
      const data = generateForecastData();
      setForecastData({
        historical: data.historical.map(d => ({ ...d, revenue: Math.round(d.revenue * 0.7) })),
        forecast: data.forecast.map(d => ({ 
          ...d, 
          predicted: Math.round(d.predicted * 0.7),
          confidence: {
            lower: Math.round(d.confidence.lower * 0.7),
            upper: Math.round(d.confidence.upper * 0.7)
          }
        }))
      });
    }
  }, [isDemoMode]);

  // Revenue Forecast Chart
  useEffect(() => {
    if (!forecastData.historical.length || !forecastRef.current) return;

    const svg = d3.select(forecastRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const allData = [...forecastData.historical, ...forecastData.forecast];
    const xScale = d3.scaleTime()
      .domain(d3.extent(allData, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([
        0,
        d3.max([
          ...forecastData.historical.map(d => d.revenue),
          ...forecastData.forecast.map(d => d.confidence.upper)
        ]) as number
      ])
      .nice()
      .range([height, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Historical line
    const historicalLine = d3.line<any>()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.revenue))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(forecastData.historical)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', historicalLine);

    // Forecast confidence area
    const confidenceArea = d3.area<any>()
      .x(d => xScale(new Date(d.date)))
      .y0(d => yScale(d.confidence.lower))
      .y1(d => yScale(d.confidence.upper))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(forecastData.forecast)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.2)
      .attr('d', confidenceArea);

    // Forecast line
    const forecastLine = d3.line<any>()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.predicted))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(forecastData.forecast)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', forecastLine);

    // Add vertical line to separate historical and forecast
    const splitDate = new Date(forecastData.forecast[0].date);
    g.append('line')
      .attr('x1', xScale(splitDate))
      .attr('x2', xScale(splitDate))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#6b7280')
      .attr('stroke-dasharray', '3,3');

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d') as any));

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${(d as number).toLocaleString()}`));

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 150}, 20)`);

    const legendItems = [
      { label: 'Historical', color: '#3b82f6', dash: 'none' },
      { label: 'Forecast', color: '#3b82f6', dash: '5,5' },
      { label: 'Confidence', color: '#3b82f6', opacity: 0.2 }
    ];

    legendItems.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      if (item.label === 'Confidence') {
        legendRow.append('rect')
          .attr('width', 12)
          .attr('height', 8)
          .attr('fill', item.color)
          .attr('fill-opacity', item.opacity);
      } else {
        legendRow.append('line')
          .attr('x1', 0)
          .attr('x2', 12)
          .attr('y1', 4)
          .attr('y2', 4)
          .attr('stroke', item.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', item.dash);
      }

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 4)
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .text(item.label);
    });

  }, [forecastData]);

  // Calculate forecast summary
  const forecastSummary = {
    nextMonth: forecastData.forecast.slice(0, 30).reduce((sum, d) => sum + d.predicted, 0),
    growth: forecastData.forecast.length > 0 ? 
      ((forecastData.forecast[29]?.predicted || 0) - (forecastData.historical.slice(-1)[0]?.revenue || 0)) / (forecastData.historical.slice(-1)[0]?.revenue || 1) * 100 : 0
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Business Intelligence</h3>

      {/* KPI vs Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(kpiTargets).map(([key, data]) => {
          const progress = (data.current / data.target) * 100;
          const isOnTrack = progress >= 90;
          
          return (
            <Card key={key} className="relative">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600 capitalize">
                  {key === 'avgValue' ? 'Avg Value' : key}
                </h4>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isOnTrack ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isOnTrack ? 'On Track' : 'Behind'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {key === 'revenue' ? '$' : ''}{data.current.toLocaleString()}{key === 'retention' || key.includes('Rate') ? '%' : ''}</span>
                  <span>Target: {key === 'revenue' ? '$' : ''}{data.target.toLocaleString()}{key === 'retention' || key.includes('Rate') ? '%' : ''}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${isOnTrack ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  {Math.round(progress)}% of target
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Revenue Forecast */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-gray-900">Revenue Forecast (60 days)</h4>
          <div className="text-sm text-gray-600">
            Predicted next month: ${Math.round(forecastSummary.nextMonth).toLocaleString()}
            <span className={`ml-2 ${forecastSummary.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({forecastSummary.growth >= 0 ? '+' : ''}{Math.round(forecastSummary.growth)}%)
            </span>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <svg ref={forecastRef} width="800" height="400" />
        </div>
      </Card>

      {/* Business Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Key Insights</h4>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-blue-700">Revenue Trend</p>
              <p className="text-sm text-gray-600">
                Forecasting {Math.round(forecastSummary.growth)}% growth over the next 30 days based on current trends
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-semibold text-green-700">Customer Acquisition</p>
              <p className="text-sm text-gray-600">
                {kpiTargets.customers.current >= kpiTargets.customers.target * 0.9 ? 
                  'Customer growth is on track to meet monthly targets' :
                  'Customer acquisition needs acceleration to meet targets'
                }
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-semibold text-purple-700">Retention Performance</p>
              <p className="text-sm text-gray-600">
                Current retention rate of {kpiTargets.retention.current}% is {
                  kpiTargets.retention.current >= kpiTargets.retention.target ?
                  'exceeding targets' : 
                  `${Math.round(kpiTargets.retention.target - kpiTargets.retention.current)}% below target`
                }
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Recommended Actions</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Optimize Peak Hours</p>
                <p className="text-sm text-gray-600">Consider dynamic pricing for high-demand time slots</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Customer Retention Program</p>
                <p className="text-sm text-gray-600">Launch loyalty program to improve retention rates</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Marketing Investment</p>
                <p className="text-sm text-gray-600">Increase acquisition spend to reach customer targets</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Operational Efficiency</p>
                <p className="text-sm text-gray-600">Focus on reducing no-show and cancellation rates</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BusinessIntelligence;