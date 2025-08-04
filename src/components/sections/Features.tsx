'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import FeatureCard from '../ui/FeatureCard';
import { 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Share2, 
  Clock, 
  BarChart, 
  Bot, 
  Globe 
} from 'lucide-react';

const Features: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <FileText />,
      title: "SEO-Optimized Copy",
      description: "AI-generated content that ranks well in search engines"
    },
    {
      icon: <Clock />,
      title: "Automated Scheduling",
      description: "Set it once and let the system publish for you"
    },
    {
      icon: <Sparkles />,
      title: "Fast + Editable Blocks",
      description: "Create content blocks that you can easily customize"
    },
    {
      icon: <Bot />,
      title: "AI Research Assistant",
      description: "Let AI gather facts and citations for your content"
    },
    {
      icon: <MessageSquare />,
      title: "Matches Brand Voice",
      description: "Content that adapts to your unique brand tone and style"
    },
    {
      icon: <BarChart />,
      title: "Performance Analytics",
      description: "Track how your content performs across platforms"
    },
    {
      icon: <Bot />,
      title: "Advanced AI Models",
      description: "Upgrade to choose from different AI models for better control and creativity"
    },
    {
      icon: <Globe />,
      title: "Multi-Language Support",
      description: "Create and translate content in over 50 languages"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Supercharge Your <span className="text-gradient">Content Creation</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Powerful features designed to transform your ideas into engaging content that converts.
          </p>
        </div>
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>

      {/* Mobile horizontal scroll for small screens */}
      <div className="md:hidden mt-8 overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 px-4 pb-4 w-max">
          {features.map((feature, index) => (
            <div key={index} className="w-72">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;