import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Toaster } from 'react-hot-toast';
import AppBar from '../components/AppBar';

const RootLayout = () => {
  return (
    <div>
      <AppBar/>
      <div className="flex h-[calc(100vh-50px)] bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default RootLayout;