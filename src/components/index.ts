// Export all components for easier imports
export { default as ParticleBackground } from './ui/ParticleBackground';
export { default as Header } from './layout/Header';
export { default as Footer } from './layout/Footer';
export { default as AuthenticatedNavbar } from './layout/AuthenticatedNavbar';
export { default as LoginModal } from './auth/LoginModal';
export { default as ErrorBoundary } from './ErrorBoundary';

// Section components
export * from './sections';

// UI components
export { default as TokenBalance } from './ui/TokenBalance';
export { default as FeatureCard } from './ui/FeatureCard';
export { default as StepCard } from './ui/StepCard';
export { default as ComponentLoader } from './ui/ComponentLoader';
export { default as HeroIllustration } from './ui/HeroIllustration';

// Modal components
export { default as AddTokensModal } from './modals/AddTokensModal';
export { default as PricingModal } from './modals/PricingModal';