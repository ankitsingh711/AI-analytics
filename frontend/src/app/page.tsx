'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Activity, BarChart3, Map, Upload, Filter, Table, Layers3, MapPin } from 'lucide-react';

import UploadComponent from '../components/UploadComponent';
import KPICards from '../components/KPICards';
import ChartsSection from '../components/ChartsSection';
import ViolationsTable from '../components/ViolationsTable';
import FiltersSection from '../components/FiltersSection';
import { Violation, DashboardStats } from '../types';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <Card className="h-96">
      <CardContent className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading interactive map...</p>
        </div>
      </CardContent>
    </Card>
  )
});

const Map3DComponent = dynamic(() => import('../components/Map3DComponent'), {
  ssr: false,
  loading: () => (
    <Card className="h-96">
      <CardContent className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading 3D map...</p>
        </div>
      </CardContent>
    </Card>
  )
});

export default function Dashboard() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState({
    drone_id: '',
    date: '',
    violation_type: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mapView, setMapView] = useState<'2d' | '3d'>('2d');

  const fetchData = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleUploadSuccess = () => {
    fetchData();
  };

  const hasActiveFilters = filters.drone_id || filters.date || filters.violation_type;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                AI Analytics Dashboard
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Real-time drone safety monitoring and violation analytics
              </p>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="animate-pulse">
                <Filter className="h-3 w-3 mr-1" />
                Filters Active
              </Badge>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Upload Drone Reports</CardTitle>
            </div>
            <CardDescription>
              Upload JSON files containing drone violation data for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadComponent onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>

        {/* KPI Cards */}
        {stats && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
            </div>
            <KPICards stats={stats} />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <Map className="h-4 w-4" />
              <span>Map View</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center space-x-2">
              <Table className="h-4 w-4" />
              <span>Data Table</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Charts Section */}
              <div className="space-y-6">
                {stats && <ChartsSection stats={stats} violations={violations} />}
              </div>
              
              {/* Map Section */}
              <div>
                <Card className="h-full border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {mapView === '2d' ? <MapPin className="h-5 w-5 text-primary" /> : <Layers3 className="h-5 w-5 text-primary" />}
                        <CardTitle>
                          {mapView === '2d' ? 'Violations Map' : '3D Violations Map'}
                        </CardTitle>
                      </div>
                      <div className="flex items-center border rounded-lg p-1">
                        <Button
                          variant={mapView === '2d' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setMapView('2d')}
                          className="h-6 px-2 text-xs"
                        >
                          2D
                        </Button>
                        <Button
                          variant={mapView === '3d' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setMapView('3d')}
                          className="h-6 px-2 text-xs"
                        >
                          3D
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {mapView === '2d' 
                        ? 'Interactive map showing violation locations with color-coded markers'
                        : 'Immersive 3D map with terrain and satellite imagery'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {mapView === '2d' ? (
                      <MapComponent violations={violations} />
                    ) : (
                      <Map3DComponent violations={violations} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {mapView === '2d' ? <MapPin className="h-5 w-5 text-primary" /> : <Layers3 className="h-5 w-5 text-primary" />}
                    <CardTitle>
                      {mapView === '2d' ? 'Interactive Violations Map' : '3D Violations Map'}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border rounded-lg p-1">
                      <Button
                        variant={mapView === '2d' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setMapView('2d')}
                        className="h-8 px-3"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        2D
                      </Button>
                      <Button
                        variant={mapView === '3d' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setMapView('3d')}
                        className="h-8 px-3"
                      >
                        <Layers3 className="h-4 w-4 mr-1" />
                        3D
                      </Button>
                    </div>
                    <Badge variant="outline">
                      {violations.length} violations
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {mapView === '2d' 
                    ? 'Explore violation locations with detailed popups and boundary overlays'
                    : 'Immersive 3D visualization of violations with terrain, satellite imagery, and interactive controls'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  {mapView === '2d' ? (
                    <MapComponent violations={violations} />
                  ) : (
                    <Map3DComponent violations={violations} />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Table Tab */}
          <TabsContent value="table" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Table className="h-5 w-5 text-primary" />
                    <CardTitle>Violations Data Table</CardTitle>
                  </div>
                  <Badge variant="outline">
                    {violations.length} records
                  </Badge>
                </div>
                <CardDescription>
                  Detailed view of all violations with sorting and filtering capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ViolationsTable violations={violations} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle>Advanced Filters</CardTitle>
                </div>
                <CardDescription>
                  Filter violations by drone ID, date, and violation type for detailed analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FiltersSection filters={filters} setFilters={setFilters} />
              </CardContent>
            </Card>

            {/* Filtered Results Summary */}
            {hasActiveFilters && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Filtered Results</CardTitle>
                  <CardDescription>
                    Showing {violations.length} violations matching your criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{violations.length}</div>
                      <div className="text-sm text-muted-foreground">Total Matches</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {new Set(violations.map(v => v.drone_id)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Unique Drones</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {new Set(violations.map(v => v.type)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Violation Types</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-sm">Loading dashboard data...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
