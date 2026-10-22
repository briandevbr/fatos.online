/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FactChecker } from './components/FactChecker';
import { RadarSection } from './components/RadarSection';
import { RecentChecks } from './components/RecentChecks';
import { Newsletter } from './components/Newsletter';
import { AboutMethodology } from './components/AboutMethodology';
import { Footer } from './components/Footer';
import { FactCheckItem, StatsData } from './types';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fatos_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentChecks, setRecentChecks] = useState<FactCheckItem[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<string>('');

  // Synchronize darkMode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fatos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fatos_theme', 'light');
    }
  }, [darkMode]);

  // Load initial data from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [checksRes, statsRes] = await Promise.all([
          fetch('/api/recent-checks?limit=15'),
          fetch('/api/stats')
        ]);

        if (checksRes.ok) {
          const checksData = await checksRes.json();
          if (checksData.data) {
            setRecentChecks(checksData.data);
          }
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.data) {
            setStats(statsData.data);
          }
        }
      } catch (err) {
        console.warn('Usando dados em cache:', err);
      }
    };

    fetchData();
  }, []);

  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleNewCheckCompleted = (newItem: FactCheckItem) => {
    setRecentChecks((prev) => [newItem, ...prev]);
    setStats((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        totalChecks: prev.totalChecks + 1,
        falsitiesDetected:
          newItem.verdict === 'falso'
            ? prev.falsitiesDetected + 1
            : prev.falsitiesDetected
      };
    });
  };

  const handleScrollToChecker = () => {
    const el = document.getElementById('checar-fato');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#060D1A] dark:text-slate-100">
      {/* Header Fixo */}
      <Header darkMode={darkMode} onToggleTheme={handleToggleTheme} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          stats={stats}
          onSelectSample={(sample) => setSelectedClaim(sample)}
          onScrollToChecker={handleScrollToChecker}
        />

        {/* Core Fact-Checker Engine */}
        <FactChecker
          initialClaimText={selectedClaim}
          onCheckCompleted={handleNewCheckCompleted}
        />

        {/* Live Google Search Grounding Radar Section */}
        <RadarSection
          onSelectClaim={(claim) => {
            setSelectedClaim(claim);
            handleScrollToChecker();
          }}
        />

        {/* Verificações Recentes Catalog */}
        <RecentChecks
          checks={recentChecks}
          onSelectClaim={(claim) => {
            setSelectedClaim(claim);
            handleScrollToChecker();
          }}
        />

        {/* Newsletter Section with LGPD */}
        <Newsletter />

        {/* About & Methodology Section */}
        <AboutMethodology />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
