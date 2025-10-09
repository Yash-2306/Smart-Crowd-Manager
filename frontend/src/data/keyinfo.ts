export interface LocationNode {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: 'transit' | 'epicenter' | 'holding' | 'chokepoint';
    maxCapacityPedestrians: number;
    maxCapacityVehicles: number;
    onGroundRiskFactor: string;
}

export interface RouteCoordinate {
    lat: number;
    lng: number;
}

export interface BackupRoute {
    id: string;
    name: string;
    pathCoordinates: RouteCoordinate[];
    strategicAdvantage: string;
}

// Static fallback data (mirrors backend — used when API is offline)
export const UJJAIN_LOCATIONS: LocationNode[] = [
    {
        id: "ujjain_jnc",
        name: "Ujjain Junction Railway Station",
        lat: 23.1786, lng: 75.7807,
        type: "transit",
        maxCapacityPedestrians: 120000,
        maxCapacityVehicles: 5000,
        onGroundRiskFactor: "Primary entry point. Unloads multi-thousand passenger waves simultaneously causing immediate street congestion."
    },
    {
        id: "mahakal_corridor",
        name: "Mahakaleshwar Temple Corridor Complex",
        lat: 23.1829, lng: 75.7682,
        type: "epicenter",
        maxCapacityPedestrians: 250000,
        maxCapacityVehicles: 0,
        onGroundRiskFactor: "Massive terminal destination. Geographically disconnected from the riverfront, causing dead-end crowd packing."
    },
    {
        id: "harsiddhi_mandir",
        name: "Harsiddhi Mata Temple Square",
        lat: 23.1802, lng: 75.7644,
        type: "chokepoint",
        maxCapacityPedestrians: 30000,
        maxCapacityVehicles: 200,
        onGroundRiskFactor: "Critical 37m-wide bottleneck between the Mahakal Corridor and Ram Ghat. Historical crush risk point (2016 incident data)."
    },
    {
        id: "ram_ghat",
        name: "Ram Ghat Riverfront Bathing Zone",
        lat: 23.1855, lng: 75.7648,
        type: "epicenter",
        maxCapacityPedestrians: 350000,
        maxCapacityVehicles: 0,
        onGroundRiskFactor: "Primary Shahi Snan bathing zone on the Kshipra. Attracts maximum pilgrim density during auspicious bath timings."
    },
    {
        id: "nanakheda_holding",
        name: "Nanakheda Bus Terminal Holding Zone",
        lat: 23.1720, lng: 75.7941,
        type: "holding",
        maxCapacityPedestrians: 80000,
        maxCapacityVehicles: 12000,
        onGroundRiskFactor: "Eastern corridor interceptor. Controls inbound vehicle flow before it enters the narrow inner-city grid."
    },
    {
        id: "mangalnath_mandir",
        name: "Mangalnath Mandir Transit Node",
        lat: 23.1554, lng: 75.7769,
        type: "transit",
        maxCapacityPedestrians: 60000,
        maxCapacityVehicles: 3000,
        onGroundRiskFactor: "Southern approach node. Feeds into the Ram Ghat riverfront via narrow heritage lanes."
    }
];

export const UJJAIN_BACKUP_ROUTES: BackupRoute[] = [
    {
        id: "b1_outer_ring_diversion",
        name: "Harifatak Outer Ring Diversion",
        pathCoordinates: [
            { lat: 23.1786, lng: 75.7807 },
            { lat: 23.1760, lng: 75.7780 },
            { lat: 23.1745, lng: 75.7720 },
            { lat: 23.1760, lng: 75.7660 },
            { lat: 23.1829, lng: 75.7682 }
        ],
        strategicAdvantage: "Bypasses the congested inner-city grid via the Harifatak road, reducing travel time by 38% during peak VFR conditions."
    },
    {
        id: "b2_dani_gate_bypass",
        name: "Dani Gate Elevated Catwalk Bypass",
        pathCoordinates: [
            { lat: 23.1829, lng: 75.7682 },
            { lat: 23.1815, lng: 75.7665 },
            { lat: 23.1802, lng: 75.7644 },
            { lat: 23.1830, lng: 75.7646 },
            { lat: 23.1855, lng: 75.7648 }
        ],
        strategicAdvantage: "Diverts 75% of Mahakal→Ram Ghat pedestrian flow above the Harsiddhi Square bottleneck, eliminating crush risk."
    }
];
