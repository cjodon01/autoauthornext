'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import LoginModal from '../../components/auth/LoginModal';
import { useAuth } from '../../lib/auth/provider';

export default function PrivacyClient() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  const openModal = () => {
    setShowLoginModal(true);
  };

  const closeModal = () => {
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header openModal={openModal} session={session} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-12 pt-20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-white/70 text-lg">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-white/50 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 space-y-8">
            
            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-white/80">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Account Information</h3>
                  <p>When you create an account, we collect your email address, name, and authentication credentials. This information is necessary to provide our services and communicate with you.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Social Media Connections</h3>
                  <p>When you connect social media accounts (Facebook, Twitter, LinkedIn, Instagram, etc.), we store OAuth tokens and basic profile information to enable content posting on your behalf. We only access the minimum permissions required for our service.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Content and Usage Data</h3>
                  <p>We store the content you create, your brand profiles, campaign settings, and usage analytics to improve our service and provide personalized experiences.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Payment Information</h3>
                  <p>Payment processing is handled by Stripe. We store only the necessary billing information and subscription status. Your full payment details are securely processed by Stripe and not stored on our servers.</p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
              </div>
              <div className="space-y-3 text-white/80">
                <p>• <strong>Service Delivery:</strong> To provide content automation, social media posting, and AI-powered content generation</p>
                <p>• <strong>Account Management:</strong> To manage your account, process payments, and provide customer support</p>
                <p>• <strong>Communication:</strong> To send service updates, security alerts, and respond to your inquiries</p>
                <p>• <strong>Improvement:</strong> To analyze usage patterns and improve our service features</p>
                <p>• <strong>Legal Compliance:</strong> To comply with applicable laws and protect our rights</p>
              </div>
            </section>

            {/* Third-Party Integrations */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-semibold">Third-Party Integrations</h2>
              </div>
              <div className="space-y-4 text-white/80">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Social Media Platforms</h3>
                  <p>We integrate with Facebook, Twitter, LinkedIn, Instagram, and other platforms. Each platform has its own privacy policy governing how they handle your data.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">AI Services</h3>
                  <p>We use OpenAI, Google, and other AI providers to generate content. Your prompts and generated content may be processed by these services according to their privacy policies.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Analytics and Infrastructure</h3>
                  <p>We use Supabase for data storage, Stripe for payments, and Google Analytics for usage tracking. These services help us provide reliable and secure service.</p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Data Security</h2>
              </div>
              <div className="space-y-3 text-white/80">
                <p>We implement industry-standard security measures to protect your data:</p>
                <p>• <strong>Encryption:</strong> All data is encrypted in transit and at rest</p>
                <p>• <strong>Access Controls:</strong> Strict access controls limit who can view your data</p>
                <p>• <strong>Regular Audits:</strong> We regularly review our security practices</p>
                <p>• <strong>Secure Infrastructure:</strong> We use trusted cloud providers with robust security</p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-semibold">Your Rights</h2>
              </div>
              <div className="space-y-3 text-white/80">
                <p>You have the following rights regarding your personal data:</p>
                <p>• <strong>Access:</strong> Request a copy of your personal data</p>
                <p>• <strong>Correction:</strong> Update or correct inaccurate information</p>
                <p>• <strong>Deletion:</strong> Request deletion of your account and data</p>
                <p>• <strong>Portability:</strong> Export your data in a machine-readable format</p>
                <p>• <strong>Objection:</strong> Object to certain processing of your data</p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <div className="text-white/80 space-y-3">
                <p>We retain your data for as long as your account is active or as needed to provide services. When you delete your account:</p>
                <p>• Personal information is deleted within 30 days</p>
                <p>• Some data may be retained for legal compliance or security purposes</p>
                <p>• Anonymized usage data may be retained for analytics</p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-semibold">Contact Us</h2>
              </div>
              <div className="text-white/80">
                <p>If you have questions about this Privacy Policy or your data, please contact us:</p>
                <p className="mt-2">
                  <strong>Email:</strong> privacy@autoauthor.cc<br />
                  <strong>Support:</strong> support@autoauthor.cc
                </p>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Policy Updates</h2>
              <div className="text-white/80">
                <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through our service. Your continued use of AutoAuthor after such changes constitutes acceptance of the updated policy.</p>
              </div>
            </section>

          </div>
        </motion.div>
      </main>

      <Footer />
      <LoginModal isOpen={showLoginModal} onClose={closeModal} />
    </div>
  );
}