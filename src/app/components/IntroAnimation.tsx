'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    initialX: number;
    initialY: number;
    size: number;
    opacity: number;
    scale: number;
    animationX: number[];
    animationY: number[];
    animationOpacity: number[];
    duration: number;
  }>>([]);

  // Initialize window size and particles on client side only
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Generate particles
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      initialX: Math.random() * width,
      initialY: Math.random() * height,
      size: Math.random() * 6 + 2,
      opacity: Math.random() * 0.5 + 0.1,
      scale: Math.random() * 0.5 + 0.5,
      animationX: [
        Math.random() * width,
        Math.random() * width,
        Math.random() * width,
      ],
      animationY: [
        Math.random() * height,
        Math.random() * height,
        Math.random() * height,
      ],
      animationOpacity: [
        Math.random() * 0.3 + 0.1,
        Math.random() * 0.5 + 0.3,
        Math.random() * 0.3 + 0.1,
      ],
      duration: Math.random() * 10 + 10,
    }));
    
    setParticles(newParticles);
    
    // Mark as loaded after initialization
    setIsLoaded(true);

    // Handle window resize
    const handleResize = () => {
      // We could update particles based on new dimensions if needed
      // For now, just keeping the event listener for future enhancements
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const messages = [
    "Existence can be rough...",
    "Time slips away...",
    "Emotions fluctuate...",
    "But with a little structure",
    "And mindful tracking",
    "We can find balance",
    "Welcome to Timewise"
  ];

  useEffect(() => {
    if (skipped) {
      onComplete();
      return;
    }

    // Set typing complete after animation duration (reduced from 5000ms to 2000ms)
    const typingTimer = setTimeout(() => {
      setTypingComplete(true);
    }, 2000);

    // Move to next step after message is shown (reduced from 9000ms to 4000ms)
    const timer = setTimeout(() => {
      if (currentStep < messages.length - 1) {
        setCurrentStep(currentStep + 1);
        setTypingComplete(false);
      } else {
        setTimeout(() => {
          onComplete();
        }, 1500); // Reduced from 3000ms to 1500ms
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(typingTimer);
    };
  }, [currentStep, onComplete, skipped, typingComplete, messages.length]);

  const handleSkip = () => {
    setSkipped(true);
  };

  return (
    <AnimatePresence>
      {!skipped && isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black intro-transition"
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute inset-0 opacity-20"
                initial={{ backgroundSize: "100%" }}
                animate={{ 
                  backgroundSize: ["100%", "120%", "100%"],
                  backgroundPosition: ["center", "center", "center"]
                }}
                transition={{ 
                  duration: 15, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(0,0,0,0) 70%)',
                }}
              />
              
              {/* Floating particles */}
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full bg-indigo-500"
                  initial={{
                    x: particle.initialX,
                    y: particle.initialY,
                    opacity: particle.opacity,
                    scale: particle.scale,
                  }}
                  animate={{
                    x: particle.animationX,
                    y: particle.animationY,
                    opacity: particle.animationOpacity,
                  }}
                  transition={{
                    duration: particle.duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                  }}
                />
              ))}
            </div>

            {/* Floating elements */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur-xl animate-float"
                style={{ 
                  top: '20%', 
                  left: '15%',
                  animationDelay: '0s'
                }}
              />
              <motion.div
                className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-xl animate-float"
                style={{ 
                  top: '60%', 
                  right: '20%',
                  animationDelay: '-2s'
                }}
              />
              <motion.div
                className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 opacity-20 blur-xl animate-float"
                style={{ 
                  bottom: '15%', 
                  left: '25%',
                  animationDelay: '-4s'
                }}
              />
            </div>

            {/* Message animation */}
            <div className="relative z-10 text-center px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1.2 }}
                  className="text-white font-light"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide">
                    <span className={`inline-block animate-typewriter ${typingComplete ? 'animate-cursor' : ''}`}>
                      {messages[currentStep]}
                    </span>
                  </h2>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
              {messages.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full ${
                    index === currentStep ? 'bg-indigo-500 w-8' : 'bg-gray-600 w-2'
                  }`}
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: index === currentStep ? 1 : 0.5,
                    width: index === currentStep ? 32 : 8
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* Skip button - Made more prominent */}
            <button
              onClick={handleSkip}
              className="absolute bottom-8 right-8 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Skip Intro
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation; 