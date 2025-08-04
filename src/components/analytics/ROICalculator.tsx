'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface ROIData {
  totalSpent: number;
  totalRevenue: number;
  roi: number;
  costPerEngagement: number;
  conversionRate: number;
}

interface ROICalculatorProps {
  data?: ROIData;
  loading?: boolean;
}

const ROICalculator: React.FC<ROICalculatorProps> = ({
  data,
  loading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    totalSpent: data?.totalSpent || 450,
    totalRevenue: data?.totalRevenue || 1200,
    engagements: 2400, // Mock engagement count
    conversions: 38 // Mock conversion count
  });

  const handleSave = () => {
    // In production, this would save to the database
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      totalSpent: data?.totalSpent || 450,
      totalRevenue: data?.totalRevenue || 1200,
      engagements: 2400,
      conversions: 38
    });
    setIsEditing(false);
  };

  // Calculate metrics
  const roi = editData.totalSpent > 0 ? ((editData.totalRevenue - editData.totalSpent) / editData.totalSpent) * 100 : 0;
  const costPerEngagement = editData.engagements > 0 ? editData.totalSpent / editData.engagements : 0;
  const conversionRate = editData.engagements > 0 ? (editData.conversions / editData.engagements) * 100 : 0;
  const costPerConversion = editData.conversions > 0 ? editData.totalSpent / editData.conversions : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  const roiMetrics = [
    {
      title: 'Return on Investment',
      value: formatPercent(roi),
      icon: TrendingUp,
      color: roi > 0 ? 'text-green-400' : 'text-red-400',
      bgColor: roi > 0 ? 'bg-green-400/10' : 'bg-red-400/10',
      borderColor: roi > 0 ? 'border-green-400/20' : 'border-red-400/20',
      trend: roi > 0 ? 'up' : 'down'
    },
    {
      title: 'Cost per Engagement',
      value: `$${costPerEngagement.toFixed(2)}`,
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      trend: 'neutral'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: ArrowUpRight,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20',
      trend: 'neutral'
    },
    {
      title: 'Cost per Conversion',
      value: `$${costPerConversion.toFixed(0)}`,
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20',
      trend: 'neutral'
    }
  ];

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">ROI Calculator</h3>
          <p className="text-white/60 text-sm">
            Track your marketing return on investment
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calculator className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
            <p className="text-white/60 text-sm">Calculating ROI...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Total Investment
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.totalSpent}
                  onChange={(e) => setEditData(prev => ({ ...prev, totalSpent: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0"
                />
              ) : (
                <div className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-2">
                  <span className="text-white font-medium">{formatCurrency(editData.totalSpent)}</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Total Revenue
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.totalRevenue}
                  onChange={(e) => setEditData(prev => ({ ...prev, totalRevenue: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-dark-lighter border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0"
                />
              ) : (
                <div className="bg-dark-lighter border border-dark-border rounded-lg px-3 py-2">
                  <span className="text-white font-medium">{formatCurrency(editData.totalRevenue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ROI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {roiMetrics.map((metric, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-lg border ${metric.bgColor} ${metric.borderColor}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  {metric.trend !== 'neutral' && (
                    <div className={`flex items-center ${metric.color}`}>
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
                <div className={`text-2xl font-bold mb-1 ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="text-white/60 text-sm">
                  {metric.title}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Profit/Loss Summary */}
          <div className="bg-dark-lighter rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Financial Summary</h4>
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Total Investment:</span>
                <span className="font-medium">{formatCurrency(editData.totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Total Revenue:</span>
                <span className="font-medium">{formatCurrency(editData.totalRevenue)}</span>
              </div>
              <div className="h-px bg-dark-border"></div>
              <div className="flex justify-between">
                <span className="text-white/70">Net Profit:</span>
                <span className={`font-bold ${editData.totalRevenue - editData.totalSpent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(editData.totalRevenue - editData.totalSpent)}
                </span>
              </div>
            </div>
          </div>

          {/* ROI Interpretation */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calculator className="h-3 w-3 text-primary" />
              </div>
              <div>
                <h5 className="font-medium text-primary mb-2">ROI Analysis</h5>
                <p className="text-white/80 text-sm">
                  {roi > 100 ? (
                    `Excellent! Your ROI of ${formatPercent(roi)} indicates highly profitable campaigns. Consider scaling your investment.`
                  ) : roi > 50 ? (
                    `Good ROI of ${formatPercent(roi)}. Your campaigns are profitable with room for optimization.`
                  ) : roi > 0 ? (
                    `Positive ROI of ${formatPercent(roi)}. Your campaigns are profitable but may need optimization.`
                  ) : (
                    `Negative ROI of ${formatPercent(roi)}. Consider reviewing your campaign strategy and targeting.`
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ROICalculator;