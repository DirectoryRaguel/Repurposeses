import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 sm:p-6 bg-white border-b border-gray-200">
      <h1 className="text-4xl sm:text-5xl font-bold text-indigo-600 tracking-tight">
        Pomelli<span className="text-pink-500">PLUS</span>
      </h1>
      <p className="mt-2 text-lg text-gray-500">
        AI-Powered Website Branding Generator
      </p>
    </header>
  );
};

export default Header;
