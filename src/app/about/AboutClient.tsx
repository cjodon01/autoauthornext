'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, Users, Zap, Heart, Lightbulb, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/lib/auth/provider';

export default function AboutClient() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  const openModal = () => {
    setShowLoginModal(true);
  };

  const closeModal = () => {
    setShowLoginModal(false);
  };

  const values = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Innovation",
      description: "We're constantly pushing the boundaries of what's possible with AI-powered content creation."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User-Centric",
      description: "Every feature we build is designed with our users' success and productivity in mind."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Quality",
      description: "We believe in delivering high-quality content that truly represents your brand voice."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Accessibility",
      description: "Making powerful content creation tools accessible to creators of all sizes and backgrounds."
    }
  ];

  const stats = [
    { number: "10K+", label: "Content Pieces Generated" },
    { number: "500+", label: "Active Users" },
    { number: "15+", label: "Platform Integrations" },
    { number: "99.9%", label: "Uptime" }
  ];

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
          <div className="text-center mb-16 pt-20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-6">
              About <span className="text-gradient">AutoAuthor</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              We&apos;re on a mission to democratize content creation by making AI-powered automation accessible to creators, marketers, and businesses of all sizes.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Our Mission</h2>
            </div>
            <div className="text-white/80 space-y-4">
              <p>
                In today&apos;s fast-paced digital world, consistent content creation has become both essential and overwhelming. We founded AutoAuthor to solve this challenge by combining the power of artificial intelligence with intuitive design.
              </p>
              <p>
                Our platform empowers creators to maintain their authentic voice while scaling their content production across multiple platforms. Whether you&apos;re a solo entrepreneur, a growing startup, or an established business, AutoAuthor helps you stay connected with your audience without the constant pressure of manual content creation.
              </p>
              <p>
                We believe that great content should be accessible to everyone, not just those with large marketing budgets or dedicated content teams.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center bg-dark-card border border-dark-border rounded-xl p-6"
              >
                <div className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Values Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-dark-card border border-dark-border rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                  </div>
                  <p className="text-white/70">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Our Story</h2>
            <div className="text-white/80 space-y-4">
              <p>
                AutoAuthor was born from the frustration of spending countless hours creating content for multiple social media platforms while trying to build a business. Our founders experienced firsthand the challenge of maintaining consistent, quality content across different channels while focusing on core business activities.
              </p>
              <p>
                After experimenting with various tools and workflows, we realized that existing solutions were either too complex, too expensive, or didn&apos;t maintain the authentic voice that makes content engaging. We set out to build something different - a platform that combines powerful AI capabilities with simplicity and affordability.
              </p>
              <p>
                Today, AutoAuthor serves creators and businesses worldwide, helping them automate their content creation while maintaining their unique brand voice and engaging their audiences effectively.
              </p>
            </div>
          </div>

          {/* Technology Section */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Our Technology</h2>
            <div className="text-white/80 space-y-4">
              <p>
                AutoAuthor is built on cutting-edge technology that prioritizes both performance and security:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">AI & Machine Learning</h3>
                  <p className="text-sm">We integrate with leading AI providers including OpenAI, Google AI, and Anthropic to deliver high-quality content generation.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Cloud Infrastructure</h3>
                  <p className="text-sm">Built on reliable cloud infrastructure with 99.9% uptime and automatic scaling to handle growing demand.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Security First</h3>
                  <p className="text-sm">End-to-end encryption, secure OAuth integrations, and compliance with data protection regulations.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Platform Integrations</h3>
                  <p className="text-sm">Native integrations with major social media platforms and content management systems.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center bg-dark-card border border-dark-border rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-white/70 mb-6">
              Have questions about AutoAuthor or want to share your feedback? We&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@autoauthor.cc"
                className="btn btn-primary"
              >
                Contact Us
              </a>
              <button
                onClick={() => router.push('/')}
                className="btn btn-secondary"
              >
                Try AutoAuthor
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
      <LoginModal isOpen={showLoginModal} onClose={closeModal} />
    </div>
  );
}