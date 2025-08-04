'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Shield, Users, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import LoginModal from '../../components/auth/LoginModal';
import { useAuth } from '../../lib/auth/provider';

export default function TermsClient() {
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-4">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-white/70 text-lg">
              Please read these terms carefully before using AutoAuthor services.
            </p>
            <p className="text-white/50 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 space-y-8">
            
            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Gavel className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
              </div>
              <div className="text-white/80 space-y-3">
                <p>By accessing and using AutoAuthor (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                <p>These Terms of Service (&quot;Terms&quot;) govern your use of our website located at autoauthor.cc and our content automation services.</p>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-semibold">Service Description</h2>
              </div>
              <div className="text-white/80 space-y-3">
                <p>AutoAuthor is a SaaS platform that provides:</p>
                <p>• AI-powered content generation for social media, blogs, and marketing materials</p>
                <p>• Automated posting and scheduling across multiple social media platforms</p>
                <p>• Brand management and content strategy tools</p>
                <p>• Integration with third-party platforms including Facebook, Twitter, LinkedIn, Instagram, and others</p>
                <p>• Analytics and performance tracking for your content</p>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-semibold">User Accounts</h2>
              </div>
              <div className="text-white/80 space-y-3">
                <p>To use our Service, you must:</p>
                <p>• Be at least 18 years old or have parental consent</p>
                <p>• Provide accurate and complete registration information</p>
                <p>• Maintain the security of your account credentials</p>
                <p>• Accept responsibility for all activities under your account</p>
                <p>• Notify us immediately of any unauthorized use of your account</p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Acceptable Use Policy</h2>
              </div>
              <div className="text-white/80 space-y-4">
                <p>You agree not to use the Service to:</p>
                <div className="space-y-2">
                  <p>• Generate or distribute illegal, harmful, or offensive content</p>
                  <p>• Violate any applicable laws or regulations</p>
                  <p>• Infringe on intellectual property rights of others</p>
                  <p>• Spam, harass, or abuse other users or platforms</p>
                  <p>• Attempt to gain unauthorized access to our systems</p>
                  <p>• Distribute malware or engage in phishing activities</p>
                  <p>• Use the service for any commercial purpose without proper licensing</p>
                </div>
                <div className="bg-dark-lighter border border-yellow-500/20 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-500">Important Note</span>
                  </div>
                  <p className="text-white/70 text-sm">You are responsible for ensuring that all content generated and posted through our service complies with the terms of service of the respective social media platforms.</p>
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-semibold">Payment Terms</h2>
              </div>
              <div className="text-white/80 space-y-3">
                <p>• Subscription fees are billed in advance on a monthly or annual basis</p>
                <p>• All payments are processed securely through Stripe</p>
                <p>• Fees are non-refundable except as required by law</p>
                <p>• We may change our pricing with 30 days notice to existing subscribers</p>
                <p>• Your subscription will automatically renew unless canceled</p>
                <p>• You can cancel your subscription at any time through your account settings</p>
                <p>• Upon cancellation, you retain access until the end of your billing period</p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Integrations</h2>
              <div className="text-white/80 space-y-3">
                <p>Our service integrates with various third-party platforms and services:</p>
                <p>• <strong>Social Media Platforms:</strong> Facebook, Twitter, LinkedIn, Instagram, Reddit, and others</p>
                <p>• <strong>AI Services:</strong> OpenAI, Google AI, Anthropic, and other AI providers</p>
                <p>• <strong>Payment Processing:</strong> Stripe for secure payment handling</p>
                <p>• <strong>Analytics:</strong> Google Analytics for usage tracking</p>
                <p>Your use of these integrated services is subject to their respective terms of service and privacy policies. We are not responsible for the practices or policies of third-party services.</p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <div className="text-white/80 space-y-3">
                <p>• You retain ownership of content you create using our service</p>
                <p>• AutoAuthor retains ownership of our software, algorithms, and platform</p>
                <p>• You grant us a license to process and store your content to provide our services</p>
                <p>• You are responsible for ensuring you have rights to any content you input into our system</p>
                <p>• AI-generated content may not be eligible for copyright protection in some jurisdictions</p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
              </div>
              <div className="text-white/80 space-y-3">
                <p>To the maximum extent permitted by law:</p>
                <p>• AutoAuthor is provided &quot;as is&quot; without warranties of any kind</p>
                <p>• We do not guarantee uninterrupted or error-free service</p>
                <p>• Our liability is limited to the amount you paid for the service in the past 12 months</p>
                <p>• We are not liable for indirect, incidental, or consequential damages</p>
                <p>• You use the service at your own risk</p>
              </div>
            </section>

            {/* Data and Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data and Privacy</h2>
              <div className="text-white/80 space-y-3">
                <p>• Your privacy is important to us - please review our Privacy Policy</p>
                <p>• We implement reasonable security measures to protect your data</p>
                <p>• You can export or delete your data at any time</p>
                <p>• We may use anonymized data for service improvement</p>
                <p>• We comply with applicable data protection laws including GDPR and CCPA</p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <div className="text-white/80 space-y-3">
                <p>• You may terminate your account at any time</p>
                <p>• We may suspend or terminate accounts that violate these terms</p>
                <p>• Upon termination, your access to the service will cease</p>
                <p>• We will retain your data for a reasonable period to allow for reactivation</p>
                <p>• Certain provisions of these terms will survive termination</p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <div className="text-white/80 space-y-3">
                <p>We reserve the right to modify these terms at any time. We will notify users of material changes via email or through our service. Your continued use of AutoAuthor after such changes constitutes acceptance of the new terms.</p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <div className="text-white/80">
                <p>These terms are governed by the laws of the jurisdiction where AutoAuthor is incorporated. Any disputes will be resolved through binding arbitration or in the courts of that jurisdiction.</p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="text-white/80">
                <p>If you have questions about these Terms of Service, please contact us:</p>
                <p className="mt-2">
                  <strong>Email:</strong> legal@autoauthor.cc<br />
                  <strong>Support:</strong> support@autoauthor.cc
                </p>
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