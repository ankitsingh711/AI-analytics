'use client';

import { useState, useEffect } from 'react';
import UploadComponent from '@/components/UploadComponent';
import KPICards from '@/components/KPICards';
import ChartsSection from '@/components/ChartsSection';
import MapComponent from '@/components/MapComponent';
import ViolationsTable from '@/components/ViolationsTable';
import FiltersSection from '@/components/FiltersSection';
import { Violation, DashboardStats } from '@/types';

export default function Dashboard() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState({
    drone_id: '',
    date: '',
    violation_type: ''
  });

  const fetchData = async () => {
    try {
      // Fetch violations with filters
      const queryParams = new URLSearchParams();
      if (filters.drone_id) queryParams.append('drone_id', filters.drone_id);
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.violation_type) queryParams.append('violation_type', filters.violation_type);

      const violationsResponse = await fetch(`http://localhost:8000/violations?${queryParams}`);
      const violationsData = await violationsResponse.json();
      setViolations(violationsData);

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:8000/dashboard/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleUploadSuccess = () => {
    fetchData(); // Refresh data after successful upload
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor drone safety violations and analytics in real-time
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <UploadComponent onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FiltersSection filters={filters} setFilters={setFilters} />
        </div>

        {/* KPI Cards */}
        {stats && (
          <div className="mb-8">
            <KPICards stats={stats} />
          </div>
        )}

        {/* Charts and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            {stats && <ChartsSection stats={stats} violations={violations} />}
          </div>
          <div>
            <MapComponent violations={violations} />
          </div>
        </div>

        {/* Violations Table */}
        <div>
          <ViolationsTable violations={violations} />
        </div>
      </div>
    </div>
  );
}
