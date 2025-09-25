import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white m-0 p-0 w-full">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default MainLayout;