
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const QuotationComparison = ({ comparisons }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Plan Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium pb-3">Feature</th>
                {comparisons.map((plan, index) => (
                  <th key={index} className="text-left font-medium pb-3">
                    {plan.company} - {plan.product}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 font-medium">Premium</td>
                {comparisons.map((plan, index) => (
                  <td key={index} className="py-3">{formatCurrency(plan.premium)}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Sum Insured</td>
                {comparisons.map((plan, index) => (
                  <td key={index} className="py-3">{formatCurrency(plan.sumInsured)}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Co-pay</td>
                {comparisons.map((plan, index) => (
                  <td key={index} className="py-3">{plan.copay}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Room Rent Limit</td>
                {comparisons.map((plan, index) => (
                  <td key={index} className="py-3">{plan.roomRent}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Pre-existing Disease Waiting Period</td>
                {comparisons.map((plan, index) => (
                  <td key={index} className="py-3">{plan.preExistingWaitingPeriod}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Maternity Benefit</td>
                {comparisons.map((plan, index) => (
                  <td key={index} className="py-3">{plan.maternity}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 font-medium">Recommended Plan</td>
                {comparisons.map((plan, index) => (
                  <td key={index} className="py-3">
                    {index === 0 ? 
                      <CheckCircle className="text-green-500 h-5 w-5" /> : 
                      <XCircle className="text-gray-300 h-5 w-5" />
                    }
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationComparison;
