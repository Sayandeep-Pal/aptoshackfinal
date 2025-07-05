import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { ArrowRight, Code, Shield, Zap, Users, Coins, Vote, TrendingUp, Wallet, Terminal, Diamond } from "lucide-react";
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import BuilderPage from "./pages/Builder";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';

import React from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './components/landing/TypewriterText';
import { FloatingShapes } from './components/landing/FloatingShapes';
import { StatsCard } from './components/landing/StatsCard';
import { Logo } from './components/landing/Logo';
import {  
  Settings, 
  ChevronRight, 
  Play, 
  Monitor, 
  Sparkles,
  Cpu,
  Database,
  Globe,
} from 'lucide-react';
import { AnimatedBackground } from './components/landing/AnimatedBackground';
import { RetroCard } from './components/landing/RetroCard';
import { RetroButton } from './components/landing/RetroButton';
import { FloatingElements } from './components/landing/FloatingElements';

// Initialize Aptos client
const aptosConfig = new AptosConfig({ network: Network.TESTNET }); // or MAINNET
const aptos = new Aptos(aptosConfig);

interface PaymentGateProps {
  children: React.ReactNode;
}

function PaymentGate({ children }: PaymentGateProps) {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [hasPaid, setHasPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState(''); // New state for project name
  const [projectNameError, setProjectNameError] = useState(''); // New state for project name validation error

  // Check if user has already paid
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (account?.address) {
        // Check localStorage for payment status (basic client-side check)
        const paidStatus = localStorage.getItem(`paid_${account.address}`);
        const storedProjectName = localStorage.getItem(`projectName_${account.address}`);
        if (paidStatus === 'true' && storedProjectName) {
          setHasPaid(true);
          setProjectName(storedProjectName); // Set project name if already paid
        }
      }
    };
    checkPaymentStatus();
  }, [account]);

  const handlePayment = async () => {
    if (!connected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!projectName.trim()) {
      setProjectNameError('Project name cannot be empty.');
      return;
    }
    setProjectNameError(''); // Clear error if input is valid

    setIsProcessing(true);
    setError('');

    try {
      // Updated transaction format for the wallet adapter
      const transaction = {
        data: {
          function: "0x5c3b2aa3cfa6103f67163f4025da028c866201380d56f7d37e6320a0e9c9756a::validator::pay_fee", // Replace with your actual deployed module address
          typeArguments: [],
          functionArguments: []
        }
      };

      const response = await signAndSubmitTransaction(transaction);
      
      // Wait for transaction confirmation
      await aptos.waitForTransaction({ transactionHash: response.hash });
      
      // Mark as paid (store in localStorage - consider server-side verification for production)
      localStorage.setItem(`paid_${account.address}`, 'true');
      // localStorage.setItem(`paid_`, 'true');
      // localStorage.setItem(`projectName_${account.address}`, projectName.trim()); // Store project name
      localStorage.setItem(`projectName_`, projectName.trim()); // Store project name
      setHasPaid(true);
      
    } catch (err) {
      console.error('Payment failed:', err);
      setError(`Payment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!connected) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh', // Changed to minHeight to prevent issues on smaller screens
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">Please connect your wallet to access the builder.</p>
        {/* WalletSelector will be rendered by the main App component, usually in a header */}
        {/* <WalletSelector /> */}
      </div>
    );
  }

  if (!hasPaid) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh', // Changed to minHeight
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 className="text-2xl font-bold mb-4">Payment Required</h2>
        <p className="text-gray-600 mb-6">Pay 0.01 APT to access the builder.</p>
        
        <div className="mb-4 w-full max-w-sm">
          <Label htmlFor="projectNameInput" className="block text-left text-gray-700 text-sm font-bold mb-2">
            Project Name:
          </Label>
          <Input
            id="projectNameInput"
            type="text"
            placeholder="e.g., My Awesome DApp"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (e.target.value.trim()) setProjectNameError(''); // Clear error on type
            }}
            className={`w-full p-2 border rounded-md focus:outline-none ${projectNameError ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isProcessing}
          />
          {projectNameError && <p className="text-red-500 text-xs italic mt-1">{projectNameError}</p>}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing || !projectName.trim()} // Disable if no project name
          className="px-8 py-4 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isProcessing ? 'Processing...' : 'Pay 0.01 APT'}
        </Button>
      </div>
    );
  }

  // If hasPaid, clone the child element and pass the projectName
  // This assumes 'children' will always be a single React element (e.g., <BuilderPage />)
  return React.Children.map(children, child => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
        return React.cloneElement(child, { ProjectName: projectName });
    }
    return child;
  });
}

const StatsCounter = ({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    className="text-center relative"
  >
    <div className="relative">
      <div className="text-4xl font-mono font-bold text-cyan-400 mb-2 relative z-10">
        {value}
      </div>
      <div className="absolute inset-0 text-4xl font-mono font-bold text-cyan-400 blur-lg opacity-30">
        {value}
      </div>
    </div>
    <div className="text-sm text-gray-400 uppercase tracking-wider font-mono">
      {label}
    </div>
    <motion.div
      className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      transition={{ duration: 1, delay: delay + 0.3 }}
    />
  </motion.div>
);

const ProcessStep = ({ 
  step, 
  title, 
  description, 
  isActive, 
  icon: Icon 
}: {
  step: number;
  title: string;
  description: string;
  isActive: boolean;
  icon: any;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: step * 0.2 }}
    className={`relative flex items-start space-x-6 p-6 rounded-lg border-2 transition-all duration-500 ${
      isActive 
        ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-400/60 shadow-cyan-400/20' 
        : 'bg-slate-900/50 border-slate-700/50 hover:border-cyan-400/30'
    } backdrop-blur-sm`}
  >
    {/* Step indicator */}
    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold border-2 ${
      isActive 
        ? 'bg-cyan-400 text-slate-900 border-cyan-400 shadow-cyan-400/50' 
        : 'bg-slate-800 text-cyan-400 border-slate-600'
    } shadow-lg transition-all duration-500`}>
      {isActive ? <Icon className="w-5 h-5" /> : step}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>

    {/* Content */}
    <div className="flex-1">
      <h4 className="font-mono font-bold text-lg text-white mb-2 uppercase tracking-wider">
        {title}
      </h4>
      <p className="text-gray-300 text-sm leading-relaxed">
        {description}
      </p>
    </div>

    {/* Connecting line */}
    {step < 4 && (
      <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-cyan-400/50 to-transparent" />
    )}
  </motion.div>
);

function HomePage() {
  const [activeStep, setActiveStep] = React.useState(1);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === 4 ? 1 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* New Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden relative">
        <FloatingShapes />
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Wallet Selector at top right */}
        <div className="fixed top-6 right-8 z-50">
          <WalletSelector />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <Logo />
          
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-8"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Zero
              </span>
              <span className="text-white ml-4">Move</span>
            </motion.h1>
          </motion.div>

          {/* Typewriter Text */}
          <div className="mb-12 max-w-4xl text-center">
            <TypewriterText 
              text="BUILDING THE NEXT GEN APTOS/MOVE DEVELOPMENT ENVIRONMENT..." 
              delay={10}
              speed={5}
            />
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <motion.a
              href="/builder"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2"
            >
              <Terminal className="w-5 h-5" />
              INITIALIZE SYSTEM
            </motion.a>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(236, 72, 153, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300 flex items-center gap-2"
            >
              <Diamond className="w-5 h-5" />
              VIEW DEMO
            </motion.button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 3 }}
            className="grid grid-cols-3 gap-8 md:gap-16"
          >
            <StatsCard value="10K+" label="SYSTEMS ONLINE" delay={3.2} />
            <StatsCard value="99.9%" label="UPTIME RATE" delay={3.4} />
            <StatsCard value="< 30s" label="DEPLOY TIME" delay={3.6} />
          </motion.div>

          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Ambient Light Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Features Grid */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold font-mono mb-6 text-white">
              CORE <span className="text-cyan-400">MODULES</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6" />
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-mono">
              {'> Advanced systems engineered for next-generation development protocols'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <RetroCard
              icon={Code}
              title="Neural Codegen"
              description="AI-powered code synthesis with quantum-enhanced pattern recognition for instant application materialization."
              delay={0}
              glowColor="cyan"
            />
            <RetroCard
              icon={Zap}
              title="Hyper Deploy"
              description="Instantaneous deployment through quantum tunneling protocols. Zero-latency global distribution network."
              delay={0.1}
              glowColor="yellow"
            />
            <RetroCard
              icon={Wallet}
              title="Crypto Bridge"
              description="Seamless blockchain integration with multi-dimensional wallet connectivity and smart contract automation."
              delay={0.2}
              glowColor="pink"
            />
            <RetroCard
              icon={Shield}
              title="Security Matrix"
              description="Military-grade encryption with adaptive threat detection and autonomous security protocol updates."
              delay={0.3}
              glowColor="green"
            />
          </div>
        </div>
      </section>

      {/* Process Demo */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold font-mono mb-6 text-white">
              EXECUTION <span className="text-cyan-400">SEQUENCE</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6" />
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-mono">
              {'> Witness the four-phase deployment protocol in real-time'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <ProcessStep
                step={1}
                title="Interface Design"
                description="Quantum-assisted UI generation with neural pattern recognition for optimal user experience synthesis."
                isActive={activeStep === 1}
                icon={Monitor}
              />
              <ProcessStep
                step={2}
                title="Code Synthesis"
                description="AI-driven code materialization using advanced algorithms and pattern-based architecture generation."
                isActive={activeStep === 2}
                icon={Cpu}
              />
              <ProcessStep
                step={3}
                title="System Integration"
                description="Automated service mesh configuration with real-time API orchestration and data flow optimization."
                isActive={activeStep === 3}
                icon={Database}
              />
              <ProcessStep
                step={4}
                title="Global Deployment"
                description="Instantaneous worldwide distribution through quantum-enhanced CDN with auto-scaling capabilities."
                isActive={activeStep === 4}
                icon={Globe}
              />
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-400/10"
              >
                {/* Terminal Header */}
                <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-700">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                  <span className="text-gray-400 font-mono text-sm ml-4">genesis-terminal</span>
                </div>

                {/* Terminal Content */}
                <div className="space-y-3 font-mono text-sm">
                  <div className="text-green-400">$ genesis init --protocol=retro-future</div>
                  <div className="text-gray-400">Initializing quantum development environment...</div>
                  <div className="text-cyan-400">✓ Neural networks: ONLINE</div>
                  <div className="text-cyan-400">✓ Deployment matrix: READY</div>
                  <div className="text-yellow-400">⚡ Step {activeStep}/4 executing...</div>
                  
                  {/* Progress bar */}
                  <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(activeStep / 4) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                      animate={{
                        x: [0, 300, 0],
                        y: [0, -200, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.5,
                        repeat: Infinity,
                      }}
                      style={{
                        left: `${20 + i * 10}%`,
                        top: `${80}%`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl" />
            
            <div className="relative bg-slate-900/50 backdrop-blur-sm border-2 border-cyan-400/30 rounded-3xl p-12">
              <h2 className="text-5xl font-bold font-mono mb-6 text-white">
                READY TO <span className="text-cyan-400">INITIALIZE</span>?
              </h2>
              <p className="text-xl mb-12 text-gray-300 font-mono">
                {'> Join the quantum development revolution. Build tomorrow\'s applications today.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <RetroButton icon={Sparkles} variant="primary" size="lg">
                  Begin Protocol
                </RetroButton>
                <RetroButton icon={ChevronRight} variant="accent" size="lg">
                  Access Terminal
                </RetroButton>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder" element={
          <PaymentGate>
            {/* BuilderPage will dynamically receive ProjectName from PaymentGate */}
            <BuilderPage /> 
          </PaymentGate>
        } />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;