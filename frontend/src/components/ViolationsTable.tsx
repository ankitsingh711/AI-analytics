'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Violation } from '../types';

interface ViolationsTableProps {
  violations: Violation[];
}

type SortField = 'date' | 'timestamp' | 'type' | 'drone_id' | 'location';
type SortOrder = 'asc' | 'desc';

export default function ViolationsTable({ violations }: ViolationsTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedViolations = [...violations].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'date':
        aValue = a.date;
        bValue = b.date;
        break;
      case 'timestamp':
        aValue = a.timestamp;
        bValue = b.timestamp;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'drone_id':
        aValue = a.drone_id;
        bValue = b.drone_id;
        break;
      case 'location':
        aValue = a.location;
        bValue = b.location;
        break;
      default:
        aValue = a.date;
        bValue = b.date;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getViolationBadgeColor = (type: string) => {
    switch (type) {
      case 'Fire Detected':
        return 'bg-red-100 text-red-800';
      case 'Unauthorized Person':
        return 'bg-orange-100 text-orange-800';
      case 'No PPE Kit':
        return 'bg-yellow-100 text-yellow-800';
      case 'Equipment Malfunction':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Violations Table</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center space-x-1">
                  <span>Time</span>
                  {getSortIcon('timestamp')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  {getSortIcon('type')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('drone_id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Drone ID</span>
                  {getSortIcon('drone_id')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('location')}
              >
                <div className="flex items-center space-x-1">
                  <span>Location</span>
                  {getSortIcon('location')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordinates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedViolations.map((violation, index) => (
              <tr key={violation.violation_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {violation.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {violation.timestamp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationBadgeColor(violation.type)}`}>
                    {violation.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {violation.drone_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {violation.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {violation.latitude.toFixed(5)}, {violation.longitude.toFixed(5)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedViolation(violation)}
                    className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedViolations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No violations found
        </div>
      )}

      {/* Violation Detail Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Violation Details</h4>
              <button
                onClick={() => setSelectedViolation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationBadgeColor(selectedViolation.type)}`}>
                  {selectedViolation.type}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Drone ID</label>
                <p className="text-sm text-gray-900">{selectedViolation.drone_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900">{selectedViolation.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <p className="text-sm text-gray-900">{selectedViolation.date} at {selectedViolation.timestamp}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                <p className="text-sm text-gray-900">
                  {selectedViolation.latitude.toFixed(5)}, {selectedViolation.longitude.toFixed(5)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <img
                  src={selectedViolation.image_url}
                  alt="Violation"
                  className="w-full h-32 object-cover rounded mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 