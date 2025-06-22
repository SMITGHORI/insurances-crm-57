
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  Flag,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useUpdateClaimBackend } from '../../hooks/useClaimsBackend';
import { toast } from 'sonner';

const RiskAssessment = ({ claim }) => {
  const [riskData, setRiskData] = useState({
    riskScore: claim?.riskScore || 50,
    fraudIndicators: claim?.fraudIndicators || [],
    investigationRequired: claim?.investigationRequired || false,
    investigationNotes: claim?.investigationNotes || '',
    riskFactors: claim?.riskFactors || []
  });

  const updateClaimMutation = useUpdateClaimBackend();

  const fraudIndicators = [
    { id: 'late_reporting', label: 'Late reporting of incident', severity: 'medium' },
    { id: 'inconsistent_story', label: 'Inconsistent story details', severity: 'high' },
    { id: 'multiple_claims', label: 'Multiple recent claims', severity: 'medium' },
    { id: 'suspicious_timing', label: 'Suspicious timing', severity: 'high' },
    { id: 'excessive_damages', label: 'Excessive damage claims', severity: 'high' },
    { id: 'no_police_report', label: 'No police report filed', severity: 'low' },
    { id: 'uncooperative', label: 'Uncooperative claimant', severity: 'medium' },
    { id: 'previous_fraud', label: 'Previous fraud history', severity: 'high' }
  ];

  const riskFactors = [
    { id: 'high_value', label: 'High value claim (>₹5L)', impact: 'financial' },
    { id: 'new_policy', label: 'Policy less than 6 months old', impact: 'temporal' },
    { id: 'complex_incident', label: 'Complex incident scenario', impact: 'investigation' },
    { id: 'multiple_parties', label: 'Multiple parties involved', impact: 'legal' },
    { id: 'medical_claims', label: 'Medical claims involved', impact: 'verification' },
    { id: 'pre_existing', label: 'Pre-existing conditions', impact: 'coverage' }
  ];

  const handleIndicatorChange = (indicatorId, checked) => {
    setRiskData(prev => ({
      ...prev,
      fraudIndicators: checked 
        ? [...prev.fraudIndicators, indicatorId]
        : prev.fraudIndicators.filter(id => id !== indicatorId)
    }));
  };

  const handleRiskFactorChange = (factorId, checked) => {
    setRiskData(prev => ({
      ...prev,
      riskFactors: checked 
        ? [...prev.riskFactors, factorId]
        : prev.riskFactors.filter(id => id !== factorId)
    }));
  };

  const handleRiskScoreChange = (value) => {
    setRiskData(prev => ({
      ...prev,
      riskScore: value[0]
    }));
  };

  const handleInvestigationToggle = (required) => {
    setRiskData(prev => ({
      ...prev,
      investigationRequired: required
    }));
  };

  const saveRiskAssessment = async () => {
    try {
      await updateClaimMutation.mutateAsync({
        id: claim._id,
        claimData: {
          riskScore: riskData.riskScore,
          fraudIndicators: riskData.fraudIndicators,
          investigationRequired: riskData.investigationRequired,
          investigationNotes: riskData.investigationNotes,
          riskFactors: riskData.riskFactors
        }
      });
      toast.success('Risk assessment updated successfully');
    } catch (error) {
      console.error('Risk assessment update error:', error);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { label: 'High Risk', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (score >= 60) return { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800', icon: Flag };
    if (score >= 40) return { label: 'Low Risk', color: 'bg-blue-100 text-blue-800', icon: Info };
    return { label: 'Very Low Risk', color: 'bg-green-100 text-green-800', icon: Shield };
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const riskLevel = getRiskLevel(riskData.riskScore);
  const RiskIcon = riskLevel.icon;

  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RiskIcon className="h-5 w-5" />
            Risk Assessment Overview
          </CardTitle>
          <Badge className={riskLevel.color}>
            {riskLevel.label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Risk Score</Label>
              <span className="text-sm font-medium">{riskData.riskScore}/100</span>
            </div>
            <Slider
              value={[riskData.riskScore]}
              onValueChange={handleRiskScoreChange}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <Label>Investigation Required</Label>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={riskData.investigationRequired ? "default" : "outline"}
                size="sm"
                onClick={() => handleInvestigationToggle(true)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Yes
              </Button>
              <Button 
                variant={!riskData.investigationRequired ? "default" : "outline"}
                size="sm"
                onClick={() => handleInvestigationToggle(false)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                No
              </Button>
            </div>
          </div>

          {riskData.investigationRequired && (
            <div className="space-y-2">
              <Label htmlFor="investigation-notes">Investigation Notes</Label>
              <Textarea
                id="investigation-notes"
                value={riskData.investigationNotes}
                onChange={(e) => setRiskData(prev => ({...prev, investigationNotes: e.target.value}))}
                placeholder="Enter investigation requirements and notes..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fraud Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Fraud Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fraudIndicators.map((indicator) => (
              <div key={indicator.id} className="flex items-center space-x-2">
                <Checkbox
                  id={indicator.id}
                  checked={riskData.fraudIndicators.includes(indicator.id)}
                  onCheckedChange={(checked) => handleIndicatorChange(indicator.id, checked)}
                />
                <Label 
                  htmlFor={indicator.id} 
                  className={`text-sm ${getSeverityColor(indicator.severity)}`}
                >
                  {indicator.label}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {indicator.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskFactors.map((factor) => (
              <div key={factor.id} className="flex items-center space-x-2">
                <Checkbox
                  id={factor.id}
                  checked={riskData.riskFactors.includes(factor.id)}
                  onCheckedChange={(checked) => handleRiskFactorChange(factor.id, checked)}
                />
                <Label htmlFor={factor.id} className="text-sm">
                  {factor.label}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {factor.impact}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          Generate Report
        </Button>
        <Button 
          onClick={saveRiskAssessment}
          disabled={updateClaimMutation.isLoading}
        >
          {updateClaimMutation.isLoading ? 'Saving...' : 'Save Assessment'}
        </Button>
      </div>
    </div>
  );
};

export default RiskAssessment;
