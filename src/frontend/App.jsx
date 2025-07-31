import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import Onboarding from './views/AssistantDeConfiguration';

const App = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const completed = await window.electronAPI.store.get('onboardingComplete');
      setOnboardingComplete(completed === true);
    };

    checkOnboardingStatus();
  }, []);

  const handleOnboardingComplete = async () => {
    await window.electronAPI.store.set('onboardingComplete', true);
    setOnboardingComplete(true);
  };

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return <RouterProvider router={router} />;
};

export default App;
