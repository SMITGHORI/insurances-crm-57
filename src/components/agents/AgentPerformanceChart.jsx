
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AgentPerformanceChart = ({ agentId }) => {
  // This would normally come from an API based on the agentId
  // For now, we'll generate some sample data based on the agent ID
  
  const generateMonthlyPerformanceData = (agentId) => {
    const basePerformance = agentId % 2 === 0 ? 75 : 85; // Use agent ID to vary the base performance
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Get data for the last 12 months
    return months.map((month, idx) => {
      // Calculate a performance that varies somewhat randomly but has a general trend
      const trend = idx / 11; // Increases from 0 to 1 across the year
      const randomVariation = Math.sin(idx * agentId) * 10; // Varies based on month and agent ID
      
      // Make performance generally increase through the year with some fluctuations
      let performance = basePerformance + (trend * 15) + randomVariation;
      performance = Math.min(100, Math.max(50, performance)); // Clamp between 50-100
      
      // For current month, use a more random value to show current status
      if (idx === currentMonth) {
        performance = basePerformance + Math.random() * 20;
      }
      
      return {
        name: month,
        performance: Math.round(performance),
        policies: Math.floor(5 + performance / 10), // Number of policies proportional to performance
        target: 85
      };
    });
  };
  
  const data = generateMonthlyPerformanceData(agentId);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="performance" 
            stroke="#3B82F6" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#D1D5DB" 
            strokeDasharray="5 5" 
          />
          <Line 
            type="monotone" 
            dataKey="policies" 
            stroke="#10B981" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgentPerformanceChart;
