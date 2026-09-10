/* ──────────────────────────────────────────────
   API Request / Response Types
   ────────────────────────────────────────────── */

export interface RouteRequest {
  start_coords: [number, number];
  end_coords: [number, number];
  payload_kg: number;
  starting_soc: number;
  optimization_priority: "time" | "cost" | "health" | "env";
}

export interface ChargingStop {
  station_id: string;
  station_name: string;
  lat: number;
  lng: number;
  wait_time_min: number;
  charge_time_min: number;
  soc_at_arrival: number;
  soc_after_charge: number;
}

export interface KPIMetrics {
  j_time_hrs: number;
  j_cost_usd: number;
  j_env_gco2: number;
  final_soc: number;
  battery_health: string;
  total_distance_km: number;
}

export interface TelemetryPoint {
  distance_km: number;
  soc: number;
}

export interface ChargingStation {
  station_id: string;
  name: string;
  lat: number;
  lng: number;
  num_plugs: number;
  power_kw: number;
}

export interface RouteResponse {
  route_polyline: [number, number][];
  charging_stops: ChargingStop[];
  kpi_metrics: KPIMetrics;
  telemetry_data: TelemetryPoint[];
  stations: ChargingStation[];
}

/* ──────────────────────────────────────────────
   Location Data — States & Cities (All India)
   ────────────────────────────────────────────── */

export interface CityData {
  name: string;
  coords: [number, number]; // [lat, lng]
}

export interface StateData {
  state: string;
  cities: CityData[];
}

export const STATES_AND_CITIES: StateData[] = [
  {
    state: "Andhra Pradesh",
    cities: [
      { name: "Visakhapatnam", coords: [17.6868, 83.2185] },
      { name: "Vijayawada", coords: [16.5062, 80.648] },
      { name: "Tirupati", coords: [13.6288, 79.4192] },
    ],
  },
  {
    state: "Assam",
    cities: [
      { name: "Guwahati", coords: [26.1445, 91.7362] },
      { name: "Dibrugarh", coords: [27.4728, 94.912] },
    ],
  },
  {
    state: "Bihar",
    cities: [
      { name: "Patna", coords: [25.6093, 85.1376] },
      { name: "Gaya", coords: [24.7914, 84.9994] },
    ],
  },
  {
    state: "Chhattisgarh",
    cities: [
      { name: "Raipur", coords: [21.2514, 81.6296] },
      { name: "Bilaspur", coords: [22.0797, 82.1409] },
    ],
  },
  {
    state: "Delhi NCR",
    cities: [
      { name: "New Delhi", coords: [28.6139, 77.209] },
      { name: "Noida", coords: [28.5355, 77.391] },
      { name: "Gurugram", coords: [28.4595, 77.0266] },
      { name: "Faridabad", coords: [28.4089, 77.3178] },
    ],
  },
  {
    state: "Goa",
    cities: [
      { name: "Panaji", coords: [15.4909, 73.8278] },
      { name: "Margao", coords: [15.2832, 73.9862] },
    ],
  },
  {
    state: "Gujarat",
    cities: [
      { name: "Ahmedabad", coords: [23.0225, 72.5714] },
      { name: "Surat", coords: [21.1702, 72.8311] },
      { name: "Vadodara", coords: [22.3072, 73.1812] },
      { name: "Rajkot", coords: [22.3039, 70.8022] },
      { name: "Gandhinagar", coords: [23.2156, 72.6369] },
    ],
  },
  {
    state: "Haryana",
    cities: [
      { name: "Panipat", coords: [29.3909, 76.9635] },
      { name: "Ambala", coords: [30.3782, 76.7767] },
      { name: "Karnal", coords: [29.6857, 76.9905] },
    ],
  },
  {
    state: "Himachal Pradesh",
    cities: [
      { name: "Shimla", coords: [31.1048, 77.1734] },
      { name: "Manali", coords: [32.2432, 77.1892] },
    ],
  },
  {
    state: "Jammu & Kashmir",
    cities: [
      { name: "Srinagar", coords: [34.0837, 74.7973] },
      { name: "Jammu", coords: [32.7266, 74.857] },
    ],
  },
  {
    state: "Jharkhand",
    cities: [
      { name: "Ranchi", coords: [23.3441, 85.3096] },
      { name: "Jamshedpur", coords: [22.8046, 86.2029] },
      { name: "Dhanbad", coords: [23.7957, 86.4304] },
    ],
  },
  {
    state: "Karnataka",
    cities: [
      { name: "Bengaluru", coords: [12.9716, 77.5946] },
      { name: "Mysuru", coords: [12.2958, 76.6394] },
      { name: "Hubli-Dharwad", coords: [15.3647, 75.124] },
      { name: "Mangaluru", coords: [12.9141, 74.856] },
    ],
  },
  {
    state: "Kerala",
    cities: [
      { name: "Kochi", coords: [9.9312, 76.2673] },
      { name: "Thiruvananthapuram", coords: [8.5241, 76.9366] },
      { name: "Kozhikode", coords: [11.2588, 75.7804] },
      { name: "Thrissur", coords: [10.5276, 76.2144] },
    ],
  },
  {
    state: "Madhya Pradesh",
    cities: [
      { name: "Bhopal", coords: [23.2599, 77.4126] },
      { name: "Indore", coords: [22.7196, 75.8577] },
      { name: "Gwalior", coords: [26.2183, 78.1828] },
      { name: "Jabalpur", coords: [23.1815, 79.9864] },
    ],
  },
  {
    state: "Maharashtra",
    cities: [
      { name: "Mumbai", coords: [19.076, 72.8777] },
      { name: "Pune", coords: [18.5204, 73.8567] },
      { name: "Nagpur", coords: [21.1458, 79.0882] },
      { name: "Nashik", coords: [19.9975, 73.7898] },
      { name: "Aurangabad", coords: [19.8762, 75.3433] },
    ],
  },
  {
    state: "Odisha",
    cities: [
      { name: "Bhubaneswar", coords: [20.2961, 85.8245] },
      { name: "Cuttack", coords: [20.4625, 85.883] },
      { name: "Puri", coords: [19.8135, 85.8312] },
    ],
  },
  {
    state: "Punjab",
    cities: [
      { name: "Chandigarh", coords: [30.7333, 76.7794] },
      { name: "Amritsar", coords: [31.634, 74.8723] },
      { name: "Ludhiana", coords: [30.901, 75.8573] },
      { name: "Jalandhar", coords: [31.326, 75.5762] },
    ],
  },
  {
    state: "Rajasthan",
    cities: [
      { name: "Jaipur", coords: [26.9124, 75.7873] },
      { name: "Udaipur", coords: [24.5854, 73.7125] },
      { name: "Jodhpur", coords: [26.2389, 73.0243] },
      { name: "Ajmer", coords: [26.4499, 74.6399] },
      { name: "Kota", coords: [25.2138, 75.8648] },
    ],
  },
  {
    state: "Tamil Nadu",
    cities: [
      { name: "Chennai", coords: [13.0827, 80.2707] },
      { name: "Coimbatore", coords: [11.0168, 76.9558] },
      { name: "Madurai", coords: [9.9252, 78.1198] },
      { name: "Salem", coords: [11.6643, 78.146] },
      { name: "Tiruchirappalli", coords: [10.7905, 78.7047] },
    ],
  },
  {
    state: "Telangana",
    cities: [
      { name: "Hyderabad", coords: [17.385, 78.4867] },
      { name: "Warangal", coords: [17.9784, 79.5941] },
      { name: "Nizamabad", coords: [18.6725, 78.094] },
    ],
  },
  {
    state: "Uttar Pradesh",
    cities: [
      { name: "Lucknow", coords: [26.8467, 80.9462] },
      { name: "Agra", coords: [27.1767, 78.0081] },
      { name: "Varanasi", coords: [25.3176, 82.9739] },
      { name: "Kanpur", coords: [26.4499, 80.3319] },
      { name: "Prayagraj", coords: [25.4358, 81.8463] },
      { name: "Meerut", coords: [28.9845, 77.7064] },
    ],
  },
  {
    state: "Uttarakhand",
    cities: [
      { name: "Dehradun", coords: [30.3165, 78.0322] },
      { name: "Haridwar", coords: [29.9457, 78.1642] },
    ],
  },
  {
    state: "West Bengal",
    cities: [
      { name: "Kolkata", coords: [22.5726, 88.3639] },
      { name: "Siliguri", coords: [26.7271, 88.3953] },
      { name: "Durgapur", coords: [23.5204, 87.3119] },
      { name: "Asansol", coords: [23.6889, 86.9661] },
    ],
  },
];

/**
 * Flat list of all cities for quick lookup.
 */
export const ALL_CITIES: (CityData & { state: string })[] =
  STATES_AND_CITIES.flatMap((s) =>
    s.cities.map((c) => ({ ...c, state: s.state }))
  );
