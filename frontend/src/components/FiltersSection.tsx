'use client';

import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Filters } from '../types';

interface FiltersSectionProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export default function FiltersSection({ filters, setFilters }: FiltersSectionProps) {
  const [drones, setDrones] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [violationTypes, setViolationTypes] = useState<string[]>([]);

  useEffect(() => {
    // Fetch filter options
    const fetchFilterOptions = async () => {
      try {
        const [dronesRes, datesRes, typesRes] = await Promise.all([
          fetch('http://localhost:8000/drones'),
          fetch('http://localhost:8000/dates'),
          fetch('http://localhost:8000/violations/types')
        ]);

        if (dronesRes.ok) {
          const dronesData = await dronesRes.json();
          setDrones(dronesData);
        }

        if (datesRes.ok) {
          const datesData = await datesRes.json();
          setDates(datesData);
        }

        if (typesRes.ok) {
          const typesData = await typesRes.json();
          setViolationTypes(typesData);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      drone_id: '',
      date: '',
      violation_type: ''
    });
  };

  const hasActiveFilters = filters.drone_id || filters.date || filters.violation_type;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drone ID Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drone ID
          </label>
          <select
            value={filters.drone_id}
            onChange={(e) => handleFilterChange('drone_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Drones</option>
            {drones.map((drone) => (
              <option key={drone} value={drone}>
                {drone}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <select
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Dates</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        {/* Violation Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Violation Type
          </label>
          <select
            value={filters.violation_type}
            onChange={(e) => handleFilterChange('violation_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {violationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.drone_id && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Drone: {filters.drone_id}
              <button
                onClick={() => handleFilterChange('drone_id', '')}
                className="ml-2 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.date && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Date: {filters.date}
              <button
                onClick={() => handleFilterChange('date', '')}
                className="ml-2 hover:text-green-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.violation_type && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Type: {filters.violation_type}
              <button
                onClick={() => handleFilterChange('violation_type', '')}
                className="ml-2 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
} 