import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlertCircle, TrendingDown, Target, Zap } from 'lucide-react';

const PredictiveSankeyDiagram = () => {
  const svgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [predictionMode, setPredictionMode] = useState('current');

  // Risk score insights
  const riskInsights = {
    'Slow Reproduction': { score: 0.592, risk: 'VERY HIGH', insight: 'Cannot recover quickly from population loss' },
    'Fast Reproduction': { score: 0.324, risk: 'HIGH', insight: 'Still vulnerable despite fast reproduction' },
    'Decreasing': { score: 0.540, risk: 'VERY HIGH', insight: 'Most important predictor of future risk' },
    'Small Range': { score: 0.282, risk: 'MEDIUM', insight: '28% of small-range animals at risk' },
    'Medium Range': { score: 0.136, risk: 'LOW', insight: 'Geographic diversity provides some protection' },
    'Large Range': { score: 0.114, risk: 'VERY LOW', insight: 'Widespread species are more resilient' }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Prediction data showing how characteristics correlate with risk
    const nodes = [
      // Current status (left side)
      { id: 0, name: "Diurnal", layer: 0, type: 'activity', riskScore: 0.321 },
      { id: 1, name: "Nocturnal", layer: 0, type: 'activity', riskScore: 0.293 },
      { id: 2, name: "Mixed Activity", layer: 0, type: 'activity', riskScore: 0.264 },
      
      { id: 3, name: "Slow Reproduction", layer: 1, type: 'repro', riskScore: 0.592 },
      { id: 4, name: "Fast Reproduction", layer: 1, type: 'repro', riskScore: 0.324 },
      { id: 5, name: "Moderate Reproduction", layer: 1, type: 'repro', riskScore: 0.309 },
      
      { id: 6, name: "Small Range", layer: 2, type: 'habitat', riskScore: 0.282 },
      { id: 7, name: "Medium Range", layer: 2, type: 'habitat', riskScore: 0.136 },
      { id: 8, name: "Large Range", layer: 2, type: 'habitat', riskScore: 0.114 },
      
      { id: 9, name: "Decreasing", layer: 3, type: 'trend', riskScore: 0.540 },
      { id: 10, name: "Stable", layer: 3, type: 'trend', riskScore: 0.065 },
      { id: 11, name: "Increasing", layer: 3, type: 'trend', riskScore: 0.180 },
      
      // Future predictions (right side)
      { id: 12, name: "HIGH RISK", layer: 4, type: 'prediction', riskScore: 0.85, count: 1200, future: true },
      { id: 13, name: "MEDIUM RISK", layer: 4, type: 'prediction', riskScore: 0.55, count: 3400, future: true },
      { id: 14, name: "LOW RISK", layer: 4, type: 'prediction', riskScore: 0.25, count: 18953, future: true }
    ];

    const links = [
      // Activity -> Reproduction
      {source: 0, target: 3, value: 10}, {source: 0, target: 4, value: 80}, {source: 0, target: 5, value: 120},
      {source: 1, target: 3, value: 120}, {source: 1, target: 4, value: 50}, {source: 1, target: 5, value: 80},
      {source: 2, target: 3, value: 15}, {source: 2, target: 4, value: 220}, {source: 2, target: 5, value: 600},
      
      // Reproduction -> Range
      {source: 3, target: 6, value: 100}, {source: 3, target: 7, value: 20}, {source: 3, target: 8, value: 5},
      {source: 4, target: 6, value: 150}, {source: 4, target: 7, value: 120}, {source: 4, target: 8, value: 80},
      {source: 5, target: 6, value: 400}, {source: 5, target: 7, value: 250}, {source: 5, target: 8, value: 50},
      
      // Range -> Trend
      {source: 6, target: 9, value: 600}, {source: 6, target: 10, value: 300}, {source: 6, target: 11, value: 50},
      {source: 7, target: 9, value: 200}, {source: 7, target: 10, value: 150}, {source: 7, target: 11, value: 20},
      {source: 8, target: 9, value: 30}, {source: 8, target: 10, value: 100}, {source: 8, target: 11, value: 5},
      
      // Trend -> Risk Prediction
      {source: 9, target: 12, value: 450}, {source: 9, target: 13, value: 320}, {source: 9, target: 14, value: 60},
      {source: 10, target: 12, value: 50}, {source: 10, target: 13, value: 280}, {source: 10, target: 14, value: 220},
      {source: 11, target: 12, value: 30}, {source: 11, target: 13, value: 120}, {source: 11, target: 14, value: 65}
    ];

    const width = 1500;
    const height = 800;
    const margin = { top: 80, right: 200, bottom: 80, left: 150 };

    // Color scale based on risk
    const getRiskColor = (score) => {
      if (score > 0.7) return '#dc2626'; // Red - Very High Risk
      if (score > 0.5) return '#f97316'; // Orange - High Risk
      if (score > 0.3) return '#eab308'; // Yellow - Medium Risk
      if (score > 0.15) return '#22c55e'; // Light Green - Low Risk
      return '#16a34a'; // Dark Green - Very Low Risk
    };

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f8fafc');

    // Calculate node positions
    const layers = [[], [], [], [], []];
    nodes.forEach(node => {
      layers[node.layer].push(node);
    });

    const layerWidth = (width - margin.left - margin.right) / 4;
    const nodePositions = {};

    layers.forEach((layer, layerIndex) => {
      const layerHeight = height - margin.top - margin.bottom;
      const nodeHeight = 45;
      const totalHeight = layer.length * (nodeHeight + 15);
      const startY = margin.top + (layerHeight - totalHeight) / 2;

      layer.forEach((node, nodeIndex) => {
        nodePositions[node.id] = {
          x: margin.left + layerIndex * layerWidth,
          y: startY + nodeIndex * (nodeHeight + 15),
          width: 130,
          height: nodeHeight,
          riskScore: node.riskScore
        };
      });
    });

    // Add gradient definitions
    const defs = svg.append('defs');
    
    const gradients = [
      { id: 'grad-high', color1: '#dc2626', color2: '#ef4444' },
      { id: 'grad-medium', color1: '#f97316', color2: '#fb923c' },
      { id: 'grad-low', color1: '#22c55e', color2: '#4ade80' }
    ];

    gradients.forEach(g => {
      const grad = defs.append('linearGradient')
        .attr('id', g.id)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', g.color1);
      grad.append('stop').attr('offset', '100%').attr('stop-color', g.color2);
    });

    // Add links
    const linkGroup = svg.append('g');

    links.forEach(link => {
      const source = nodePositions[link.source];
      const target = nodePositions[link.target];

      const maxValue = Math.max(...links.map(l => l.value));
      const linkHeight = Math.max(2, (link.value / maxValue) * 25);

      // Bezier curve for link
      const path = d3.path();
      path.moveTo(source.x + source.width, source.y + source.height / 2);
      path.bezierCurveTo(
        source.x + source.width + 40,
        source.y + source.height / 2,
        target.x - 40,
        target.y + target.height / 2,
        target.x,
        target.y + target.height / 2
      );
      path.lineTo(target.x, target.y + target.height / 2 - linkHeight / 2);
      path.bezierCurveTo(
        target.x - 40,
        target.y + target.height / 2 - linkHeight / 2,
        source.x + source.width + 40,
        source.y + source.height / 2 - linkHeight / 2,
        source.x + source.width,
        source.y + source.height / 2 - linkHeight / 2
      );
      path.closePath();

      const sourceScore = nodes[link.source].riskScore;
      const targetScore = nodes[link.target].riskScore;
      const avgScore = (sourceScore + targetScore) / 2;

      linkGroup.append('path')
        .attr('d', path)
        .attr('fill', getRiskColor(avgScore))
        .attr('opacity', 0.25)
        .attr('stroke', 'none')
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).attr('opacity', 0.6);
        })
        .on('mouseleave', function() {
          d3.select(this).attr('opacity', 0.25);
        });
    });

    // Add nodes
    const nodeGroup = svg.append('g');

    nodes.forEach(node => {
      const pos = nodePositions[node.id];
      const color = getRiskColor(node.riskScore);

      const g = nodeGroup.append('g')
        .attr('transform', `translate(${pos.x},${pos.y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.selectAll('rect').attr('opacity', 0.3);
          d3.select(this).select('rect').attr('opacity', 1);
          setHoveredNode(node.id);
        })
        .on('mouseleave', function() {
          d3.selectAll('rect').attr('opacity', 0.85);
          setHoveredNode(null);
        })
        .on('click', function() {
          setSelectedNode(selectedNode === node.id ? null : node.id);
        });

      // Node rectangle
      const rect = g.append('rect')
        .attr('width', pos.width)
        .attr('height', pos.height)
        .attr('rx', 6)
        .attr('fill', color)
        .attr('opacity', 0.85)
        .attr('stroke', node.future ? '#fff' : 'none')
        .attr('stroke-width', node.future ? 2 : 0);

      // Node text
      const words = node.name.split(' ');
      const text = g.append('text')
        .attr('x', pos.width / 2)
        .attr('y', pos.height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'white')
        .attr('font-weight', 600)
        .attr('font-size', 11)
        .style('pointer-events', 'none');

      words.forEach((word, i) => {
        text.append('tspan')
          .attr('x', pos.width / 2)
          .attr('dy', i === 0 ? 0 : 12)
          .text(word);
      });

      // Risk score badge
      const scoreText = (node.riskScore * 100).toFixed(0);
      g.append('text')
        .attr('x', pos.width - 8)
        .attr('y', pos.height / 2 - 12)
        .attr('text-anchor', 'end')
        .attr('font-size', 9)
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .style('pointer-events', 'none')
        .text(scoreText + '%');
    });

    // Add layer labels
    const layerLabels = [
      'ACTIVITY\nPATTERN',
      'REPRODUCTION\nRATE',
      'GEOGRAPHIC\nRANGE',
      'POPULATION\nTREND',
      'RISK\nPREDICTION'
    ];
    layerLabels.forEach((label, i) => {
      const x = margin.left + i * layerWidth;
      svg.append('text')
        .attr('x', x)
        .attr('y', 25)
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('fill', '#1f2937')
        .attr('text-anchor', 'start')
        .style('pointer-events', 'none')
        .text(label);
    });

    // Add legend
    const legendData = [
      { score: 0.9, label: 'Very High Risk (>70%)', color: '#dc2626' },
      { score: 0.6, label: 'High Risk (50-70%)', color: '#f97316' },
      { score: 0.4, label: 'Medium Risk (30-50%)', color: '#eab308' },
      { score: 0.2, label: 'Low Risk (15-30%)', color: '#22c55e' },
      { score: 0.08, label: 'Very Low Risk (<15%)', color: '#16a34a' }
    ];

    const legendGroup = svg.append('g')
      .attr('transform', `translate(${width - 180}, ${margin.top})`);

    legendGroup.append('text')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .text('Risk Level');

    legendData.forEach((item, i) => {
      const g = legendGroup.append('g')
        .attr('transform', `translate(0, ${(i + 1) * 25})`);

      g.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('rx', 3)
        .attr('fill', item.color);

      g.append('text')
        .attr('x', 22)
        .attr('y', 12)
        .attr('font-size', 11)
        .attr('fill', '#666')
        .text(item.label);
    });

  }, [selectedNode]);

  const selectedNodeData = selectedNode !== null ? {
    'Slow Reproduction': riskInsights['Slow Reproduction'],
    'Fast Reproduction': riskInsights['Fast Reproduction'],
    'Decreasing': riskInsights['Decreasing'],
    'Small Range': riskInsights['Small Range'],
    'Medium Range': riskInsights['Medium Range'],
    'Large Range': riskInsights['Large Range']
  }[Object.keys(riskInsights).find(key => key.includes(selectedNode))] : null;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f8fafc', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 10px 0' }}>
            Predictive Conservation Risk Analysis
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
            ML model predicts which animals could become conservation concerns based on their characteristics
          </p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 15px', background: '#dbeafe', borderRadius: '6px', fontSize: '13px', color: '#1e40af', fontWeight: '600' }}>
              Model Accuracy: 79.18%
            </div>
            <div style={{ padding: '10px 15px', background: '#fef3c7', borderRadius: '6px', fontSize: '13px', color: '#92400e', fontWeight: '600' }}>
              Top Predictor: Population Trend (90.3% importance)
            </div>
            <div style={{ padding: '10px 15px', background: '#dcfce7', borderRadius: '6px', fontSize: '13px', color: '#166534', fontWeight: '600' }}>
              High-Risk Animals: 1,200 identified
            </div>
          </div>
        </div>

        {/* Main Diagram */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'auto', marginBottom: '30px' }}>
          <svg ref={svgRef}></svg>
        </div>

        {/* Key Findings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #dc2626' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <AlertCircle size={20} color="#dc2626" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>High-Risk Profile</h3>
            </div>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <p><strong>Characteristics:</strong> Nocturnal + Slow Reproduction + Small Range + Decreasing</p>
              <p><strong>Risk Score:</strong> 98.6%</p>
              <p><strong>Examples:</strong> Koala, Tasmanian Devil, Gila Monster</p>
              <p style={{ color: '#dc2626', fontWeight: '600', margin: '10px 0 0 0' }}>Action: Immediate conservation intervention needed</p>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #f97316' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <TrendingDown size={20} color="#f97316" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Medium-Risk Pattern</h3>
            </div>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <p><strong>Characteristics:</strong> Decreasing population + Small range (regardless of reproduction)</p>
              <p><strong>Risk Score:</strong> 54.0%</p>
              <p><strong>Count:</strong> ~3,400 animals</p>
              <p style={{ color: '#f97316', fontWeight: '600', margin: '10px 0 0 0' }}>Action: Monitor trends and develop protection plans</p>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #22c55e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Zap size={20} color="#22c55e" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Low-Risk Profile</h3>
            </div>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <p><strong>Characteristics:</strong> Stable/Increasing + Large range (most resilient)</p>
              <p><strong>Risk Score:</strong> 6.5% - 18.0%</p>
              <p><strong>Count:</strong> ~18,900 animals</p>
              <p style={{ color: '#22c55e', fontWeight: '600', margin: '10px 0 0 0' }}>Status: Generally stable, continue monitoring</p>
            </div>
          </div>
        </div>

        {/* Feature Importance */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>Feature Importance for Risk Prediction</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { name: 'Population Trend', importance: 90.3, desc: 'Whether population is increasing, stable, or decreasing' },
              { name: 'Geographic Range', importance: 6.2, desc: 'How widely distributed the species is' },
              { name: 'Activity Pattern', importance: 1.9, desc: 'Whether active during day, night, or both' },
              { name: 'Reproduction Rate', importance: 1.6, desc: 'How quickly species can reproduce' }
            ].map((feature, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{feature.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#667eea' }}>{feature.importance}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: feature.importance + '%', height: '100%', background: '#667eea', borderRadius: '3px' }}></div>
                </div>
                <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 15px 0' }}>How to Use This Tool</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' }}> 1. Read the Flow</h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                Follow flows from left to right to see how animal characteristics combine to predict conservation risk. Flow thickness represents number of animals.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' }}> 2. Check Risk Scores</h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                Each node shows a risk percentage (0-100%). Red = high risk, green = low risk. Red nodes are animals predicted to become conservation concerns.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' }}> 3. Hover for Details</h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                Hover over any node or flow to highlight related paths. This shows you which characteristics lead to high-risk outcomes.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' }}> 4. Identify Patterns</h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                Notice which characteristics cluster together in high-risk animals. Small range + decreasing populations = highest risk.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' }}> 5. Plan Actions</h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                Use risk predictions to prioritize conservation efforts. Focus on high-risk characteristics first (e.g., increasing protection for small-range species).
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0'}}> 6. Proactive Monitoring</h3>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                Monitor animals with risky combinations even if currently "Least Concern". Early intervention prevents future endangered status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveSankeyDiagram;