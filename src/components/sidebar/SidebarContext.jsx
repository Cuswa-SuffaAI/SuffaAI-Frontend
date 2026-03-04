import React, { createContext, useContext, useState, useEffect } from 'react';

// 1️⃣ Context oluştur
const SidebarContext = createContext();

// 2️⃣ Provider component
export const SidebarProvider = ({ children }) => {
  // Başlangıç durumu: mobilde kapalı, tablet ve üstünde açık
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // md ve üstü default açık
    }
    return false; // SSR veya undefined için güvenli değer
  });

  // Resize ile responsive olarak aç/kapat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle fonksiyonu
  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// 3️⃣ Custom hook kullanımı
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};