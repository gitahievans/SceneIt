
import HomePageContent from '@/components/HomeComponent';
import LoginCheckHandler from '@/components/LoginCheckHandler';
import { Suspense } from 'react';

const HomePage = () => {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg dark:text-white">Loading amazing content...</p>
        </div>
      </div>
    }>
      <LoginCheckHandler />
      <HomePageContent />
    </Suspense>
  );
};

export default HomePage;