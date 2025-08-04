'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';
import StepCard from '../ui/StepCard';
import { Settings, FileText, Send } from 'lucide-react';

interface HowItWorksProps {
  session?: any;
  openModal?: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ session, openModal }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const router = useRouter();

  const handleStartCreating = () => {
    if (session) {
      router.push('/dashboard');
    } else if (openModal) {
      openModal();
    }
  };

  const steps = [
    {
      number: 1,
      icon: <Settings className="h-8 w-8 text-primary" />,
      title: "Connect your Platforms",
      description: "Link your social accounts so AutoAuthor can publish on your behalf."
    },
    {
      number: 2,
      icon: <FileText className="h-8 w-8 text-secondary" />,
      title: "Create a Brand",
      description: "Add your brand's name, industry, and voice to personalize your content."
    },
    {
      number: 3,
      icon: <Send className="h-8 w-8 text-accent" />,
      title: <span className="text-gradient">Launch a Campaign.</span>,
      description: "Set your content type, strategy, and schedule. AutoAuthor handles the rest."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section id="how-it-works" className="py-20 relative bg-dark-lighter">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="text-gradient">AutoAuthor</span> Works
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Three simple steps to transform your content creation process.
          </p>
        </div>
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto"
        >
          {steps.map((step, index) => (
            <StepCard
              key={index}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Ready to revolutionize your content creation workflow?
          </p>
          <button 
            onClick={handleStartCreating}
            className="btn btn-primary inline-block"
          >
            Start Creating Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;