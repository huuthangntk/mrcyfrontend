"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/components/Dashboard';

interface DashboardPageProps {
  params: {
    locale: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <Dashboard />
      </div>
    </ProtectedRoute>
  );
} 