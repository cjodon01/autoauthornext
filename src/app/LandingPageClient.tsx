'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ParticleBackground from '../components/ui/ParticleBackground';
import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import HowItWorks from '../components/sections/HowItWorks';
import SectionDivider from '../components/sections/SectionDivider';
import Footer from '../components/layout/Footer';
import LoginModal from '../components/auth/LoginModal';
import { useAuth } from '../lib/auth/provider';

const LandingPageClient: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { session, loading } = useAuth();
  const router = useRouter();

  const openModal = () => {
    setShowLoginModal(true);
  };

  const closeModal = () => {
    setShowLoginModal(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => scrollToSection('how-it-works');

  return (
    <div className="relative min-h-screen bg-dark">
      <ParticleBackground />
      <Header openModal={openModal} />
      
      <main>
        <Hero 
          openModal={openModal} 
          scrollToHowItWorks={scrollToHowItWorks} 
        />
        <SectionDivider />
        <Features />
        <SectionDivider variant="reverse" />
        <HowItWorks session={session} openModal={openModal} />
        <SectionDivider />
      </main>
      
      <Footer />
      <LoginModal isOpen={showLoginModal} onClose={closeModal} />
    </div>
  );
};

export default LandingPageClient;