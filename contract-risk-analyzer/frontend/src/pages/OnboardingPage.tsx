import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import FlightDeckScene from '../components/hud/FlightDeckScene';
import OnboardingCard from '../components/auth/OnboardingCard';
import { useAuth } from '../context/AuthContext';

const OnboardingPage: React.FC = () => {
  const { onboard } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleOnboard = async (name: string, age: string) => {
    setLoading(true);
    setError(undefined);
    
    const result = await onboard(name, age);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-surface,#F5FBFA)] flex flex-col font-sans overflow-hidden">
      <div className="absolute inset-0 z-0">
        <FlightDeckScene />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <OnboardingCard 
            onSubmit={handleOnboard}
            loading={loading} 
            error={error}
          />
        </main>
      </div>
    </div>
  );
};

export default OnboardingPage;
