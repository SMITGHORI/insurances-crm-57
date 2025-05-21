
import React from 'react';

const AgentPerformanceIndicator = ({ score }) => {
  let barColor = 'bg-red-500';
  
  if (score >= 90) {
    barColor = 'bg-green-500';
  } else if (score >= 70) {
    barColor = 'bg-blue-500';
  } else if (score >= 50) {
    barColor = 'bg-yellow-500';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${barColor} h-2 rounded-full`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AgentPerformanceIndicator;
