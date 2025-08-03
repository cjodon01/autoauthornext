import React from 'react';
import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Profile & Settings - AutoAuthor',
  description: 'Manage your profile, preferences, and account settings',
};

export default function ProfilePage() {
  return <ProfileClient />;
}