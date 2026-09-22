import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChatWidget } from '../components/ChatWidget';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default MainLayout;