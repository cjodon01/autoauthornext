import React from 'react';
import { Metadata } from 'next';
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = {
  title: 'Analytics - AutoAuthor',
  description: 'Track your content performance and engagement metrics',
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}