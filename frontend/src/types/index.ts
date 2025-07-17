export interface Violation {
  violation_id: string;
  type: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  image_url: string;
  drone_id: string;
  date: string;
  location: string;
}

export interface DashboardStats {
  total_violations: number;
  violations_by_type: { [key: string]: number };
  drones: string[];
  locations: string[];
  recent_violations: Violation[];
}

export interface Filters {
  drone_id: string;
  date: string;
  violation_type: string;
} 