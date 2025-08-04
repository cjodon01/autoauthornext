import React from 'react';
import { Metadata } from 'next';
import PendingPostsClient from './PendingPostsClient';

export const metadata: Metadata = {
  title: 'Scheduled Posts - AutoAuthor',
  description: 'Manage your scheduled posts and publication queue',
};

export default function PendingPostsPage() {
  return <PendingPostsClient />;
}