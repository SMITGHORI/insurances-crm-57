
import React from 'react';

const AgentPerformanceIndicator = ({ score }) => {
  let barColor = 'bg-red-500';
  let textColor = 'text-red-700';
  let label = 'Needs Improvement';
  
  if (score >= 90) {
    barColor = 'bg-green-500';
    textColor = 'text-green-700';
    label = 'Excellent';
  } else if (score >= 70) {
    barColor = 'bg-blue-500';
    textColor = 'text-blue-700';
    label = 'Good';
  } else if (score >= 50) {
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-700';
    label = 'Average';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${textColor}`}>{score}% - {label}</span>
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
