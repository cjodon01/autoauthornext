'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  Eye, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Receipt,
  AlertTriangle,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  tokensIncluded: number;
  isPopular?: boolean;
}

interface BillingInfo {
  subscription: {
    plan: SubscriptionPlan;
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  paymentMethod: {
    type: 'card';
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  usage: {
    tokensUsed: number;
    tokensLimit: number;
    billingPeriodStart: string;
    billingPeriodEnd: string;
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    downloadUrl?: string;
  }>;
}

const BillingSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  // Mock billing data
  const availablePlans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'month',
      tokensIncluded: 10000,
      features: [
        '10,000 tokens per month',
        '5 social media accounts',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      interval: 'month',
      tokensIncluded: 50000,
      features: [
        '50,000 tokens per month',
        'Unlimited social accounts',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access'
      ],
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      interval: 'month',
      tokensIncluded: 200000,
      features: [
        '200,000 tokens per month',
        'Everything in Professional',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantees'
      ]
    }
  ];

  const billingInfo: BillingInfo = {
    subscription: {
      plan: availablePlans[1], // Professional plan
      status: 'active',
      currentPeriodEnd: addMonths(new Date(), 1).toISOString(),
      cancelAtPeriodEnd: false
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2027
    },
    usage: {
      tokensUsed: 32450,
      tokensLimit: 50000,
      billingPeriodStart: addMonths(new Date(), -1).toISOString(),
      billingPeriodEnd: new Date().toISOString()
    },
    invoices: [
      {
        id: 'inv_001',
        date: addMonths(new Date(), -1).toISOString(),
        amount: 79,
        status: 'paid',
        downloadUrl: '#'
      },
      {
        id: 'inv_002',
        date: addMonths(new Date(), -2).toISOString(),
        amount: 79,
        status: 'paid',
        downloadUrl: '#'
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'trialing':
        return <Clock className="h-4 w-4 text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'past_due':
        return 'text-amber-400 bg-amber-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      case 'trialing':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const usagePercentage = (billingInfo.usage.tokensUsed / billingInfo.usage.tokensLimit) * 100;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Billing & Subscription
        </h2>
        <p className="text-white/70 text-sm">
          Manage your subscription, payment method, and billing history
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-dark-lighter border border-dark-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                {billingInfo.subscription.plan.isPopular && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    <Star className="h-3 w-3" />
                    Popular
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-white">
                  {billingInfo.subscription.plan.name}
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(billingInfo.subscription.status)}`}>
                  {getStatusIcon(billingInfo.subscription.status)}
                  {billingInfo.subscription.status}
                </div>
              </div>
              <p className="text-white/60">
                ${billingInfo.subscription.plan.price}/{billingInfo.subscription.plan.interval}
              </p>
            </div>
            
            <button
              onClick={() => setShowPlans(!showPlans)}
              className="btn btn-primary"
            >
              {showPlans ? 'Hide Plans' : 'Change Plan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Next billing date</p>
              <p className="text-white font-medium">
                {format(new Date(billingInfo.subscription.currentPeriodEnd), 'MMMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Tokens included</p>
              <p className="text-white font-medium">
                {billingInfo.subscription.plan.tokensIncluded.toLocaleString()} / {billingInfo.subscription.plan.interval}
              </p>
            </div>
          </div>

          {billingInfo.subscription.cancelAtPeriodEnd && (
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-lg">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Your subscription will be cancelled at the end of the current billing period
              </div>
            </div>
          )}
        </div>

        {/* Available Plans */}
        {showPlans && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-dark-lighter border rounded-xl p-6 relative ${
                  plan.id === billingInfo.subscription.plan.id
                    ? 'border-primary'
                    : plan.isPopular
                      ? 'border-primary/50'
                      : 'border-dark-border'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-white/60">/{plan.interval}</span>
                  </div>
                  <p className="text-white/60 text-sm">
                    {plan.tokensIncluded.toLocaleString()} tokens included
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    plan.id === billingInfo.subscription.plan.id
                      ? 'bg-dark-border text-white/60 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/80 text-white'
                  }`}
                  disabled={plan.id === billingInfo.subscription.plan.id}
                >
                  {plan.id === billingInfo.subscription.plan.id ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Usage */}
        <div className="bg-dark-lighter border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Token Usage
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80">Current billing period</span>
              <span className="text-white font-medium">
                {billingInfo.usage.tokensUsed.toLocaleString()} / {billingInfo.usage.tokensLimit.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-dark-border rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full ${
                  usagePercentage > 90 
                    ? 'bg-red-400' 
                    : usagePercentage > 75 
                      ? 'bg-amber-400' 
                      : 'bg-primary'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-2 text-sm text-white/60">
              <span>
                {format(new Date(billingInfo.usage.billingPeriodStart), 'MMM dd')} - {format(new Date(billingInfo.usage.billingPeriodEnd), 'MMM dd')}
              </span>
              <span>{usagePercentage.toFixed(1)}% used</span>
            </div>
          </div>

          {usagePercentage > 90 && (
            <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                You&apos;re running low on tokens. Consider upgrading your plan to avoid service interruption.
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-dark-lighter border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm">
              Update
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-dark rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">
                {billingInfo.paymentMethod.brand} ending in {billingInfo.paymentMethod.last4}
              </p>
              <p className="text-white/60 text-sm">
                Expires {billingInfo.paymentMethod.expiryMonth}/{billingInfo.paymentMethod.expiryYear}
              </p>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-dark-lighter border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Billing History
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              View All
            </button>
          </div>

          <div className="space-y-3">
            {billingInfo.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-dark-lighter/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${
                    invoice.status === 'paid' 
                      ? 'bg-green-400/20 text-green-400'
                      : invoice.status === 'pending'
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'bg-red-400/20 text-red-400'
                  }`}>
                    {invoice.status === 'paid' && <CheckCircle className="h-4 w-4" />}
                    {invoice.status === 'pending' && <Clock className="h-4 w-4" />}
                    {invoice.status === 'failed' && <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      ${invoice.amount.toFixed(2)}
                    </p>
                    <p className="text-white/60 text-sm">
                      {format(new Date(invoice.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    invoice.status === 'paid' 
                      ? 'bg-green-400/20 text-green-400'
                      : invoice.status === 'pending'
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'bg-red-400/20 text-red-400'
                  }`}>
                    {invoice.status}
                  </span>
                  {invoice.downloadUrl && invoice.status === 'paid' && (
                    <button
                      className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Download invoice"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Contact */}
        <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-400 mb-2">Need Help with Billing?</h4>
              <p className="text-white/80 text-sm mb-3">
                Our billing team is here to help with any questions about your subscription, invoices, or payment issues.
              </p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Contact Billing Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;