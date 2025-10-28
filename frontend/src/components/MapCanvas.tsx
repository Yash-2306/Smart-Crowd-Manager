import React, { useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import type { LocationNode } from '../data/keyinfo';
import { UJJAIN_LOCATIONS, UJJAIN_BACKUP_ROUTES } from '../data/keyinfo';
import type { SimMetrics } from '../data/simulationEngine';

declare const google: any;

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAT_85QglVkY0TBfcM5qwoLNoE6oJ7WREA';

interface MapCanvasProps {
    simulationActive: boolean;
    mitigationDiversion: boolean;
    mitigationBypass: boolean;
    simMetrics: SimMetrics | null;
    selectedNode: LocationNode | null;
    onNodeSelect: (node: LocationNode) => void;
}

// Custom Dark Theme for Google Maps
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f19" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0b1329" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f172a" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#0b1329" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#070b13" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#070b13" }] },
];

let ReactOverlayClass: any = null;

function getReactOverlayClass() {
    if (ReactOverlayClass) return ReactOverlayClass;

    ReactOverlayClass = class extends google.maps.OverlayView {
        private element: HTMLElement;
        private position: any;

        constructor(position: any, element: HTMLElement) {
            super();
            this.position = position;
            this.element = element;
        }

        onAdd() {
            const pane = (this as any).getPanes()?.overlayMouseTarget;
            if (pane) {
                pane.appendChild(this.element);
            }
        }

        draw() {
            const projection = (this as any).getProjection();
            if (!projection) return;
            const point = projection.fromLatLngToDivPixel(this.position);
            if (point) {
                this.element.style.left = `${point.x}px`;
                this.element.style.top = `${point.y}px`;
                this.element.style.position = 'absolute';
                this.element.style.transform = 'translate(-50%, -50%)';
                this.element.style.cursor = 'pointer';
            }
        }

        onRemove() {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }
    };

    return ReactOverlayClass;
}

const compileMarkerHTML = (node: LocationNode, isSimulationActive: boolean, isSelected: boolean, nodeStatus?: any) => {
    const isSelectedClass = isSelected ? 'ring-4 ring-cyan-400 rounded-full p-1 scale-125' : '';

    if (isSimulationActive && nodeStatus) {
        const vfrStr = `VFR: ${nodeStatus.vfr.toFixed(2)}`;

        if (nodeStatus.status === 'danger') {
            return `
        <div class="relative flex items-center justify-center ${isSelectedClass}">
          <div class="absolute w-12 h-12 bg-red-500/40 rounded-full animate-ping"></div>
          <div class="absolute w-20 h-20 bg-red-500/20 rounded-full animate-pulse"></div>
          <div class="relative w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-2 border-white text-white font-bold text-xs shadow-lg shadow-red-500/80">
            ⚡
          </div>
          <div class="absolute -bottom-8 bg-red-950 border border-red-500 text-red-300 font-mono font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap shadow-lg tracking-wider uppercase">
            CRUSH (${vfrStr})
          </div>
        </div>
      `;
        }

        if (nodeStatus.status === 'warning') {
            return `
        <div class="relative flex items-center justify-center ${isSelectedClass}">
          <div class="absolute w-10 h-10 bg-amber-500/30 rounded-full animate-ping"></div>
          <div class="relative w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900 text-slate-950 font-bold text-xs shadow-md">
            ⚠
          </div>
          <div class="absolute -bottom-7 bg-amber-950 border border-amber-500/60 text-amber-300 font-mono px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap shadow-md">
            WARN (${vfrStr})
          </div>
        </div>
      `;
        }

        return `
      <div class="relative flex items-center justify-center ${isSelectedClass}">
        <div class="relative w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center border border-emerald-300 text-white font-medium text-[10px] shadow-sm">
          ✓
        </div>
        <div class="absolute -bottom-6 bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap">
          ${vfrStr}
        </div>
      </div>
    `;
    }

    const typeIcons: Record<string, string> = {
        transit: '🚂',
        epicenter: '⛩',
        holding: '🅿',
        chokepoint: '⚡',
    };

    return `
    <div class="relative flex items-center justify-center ${isSelectedClass}">
      <div class="relative w-8 h-8 bg-slate-900 border-2 border-cyan-400 rounded-full flex items-center justify-center text-cyan-300 font-bold text-sm shadow-lg shadow-cyan-950/50">
        ${typeIcons[node.type] || '📍'}
      </div>
      <div class="absolute -bottom-6 bg-slate-950 border border-slate-700 text-slate-200 font-sans px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap shadow">
        ${node.name.split(' ')[0]}
      </div>
    </div>
  `;
};

const MapInner: React.FC<MapCanvasProps> = ({
    simulationActive,
    mitigationDiversion,
    mitigationBypass,
    simMetrics,
    selectedNode,
    onNodeSelect,
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const trafficLayerRef = useRef<any>(null);
    const overlaysRef = useRef<any[]>([]);
    const polylinesRef = useRef<any[]>([]);

    useEffect(() => {
        if (!mapRef.current || googleMapRef.current) return;

        // Focused on Ujjain Mahakal Corridor & Ram Ghat area
        const ujjainCenter = { lat: 23.1800, lng: 75.7720 };

        const map = new google.maps.Map(mapRef.current, {
            center: ujjainCenter,
            zoom: 14,
            styles: darkMapStyle,
            disableDefaultUI: true,
            zoomControl: true,
            backgroundColor: '#070b13',
        });

        googleMapRef.current = map;

        // Mount Live Traffic Layer
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
        trafficLayerRef.current = trafficLayer;
    }, []);

    // Re-render markers and overlays when simulation state updates
    useEffect(() => {
        if (!googleMapRef.current) return;

        // Remove old overlays
        overlaysRef.current.forEach(overlay => overlay.setMap(null));
        overlaysRef.current = [];

        const OverlayClass = getReactOverlayClass();

        UJJAIN_LOCATIONS.forEach(node => {
            const isSelected = selectedNode?.id === node.id;
            const nodeStatus = simMetrics?.nodes[node.id];

            const el = document.createElement('div');
            el.innerHTML = compileMarkerHTML(node, simulationActive, isSelected, nodeStatus);
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                onNodeSelect(node);
            });

            const overlay = new OverlayClass(
                new google.maps.LatLng(node.lat, node.lng),
                el
            );

            overlay.setMap(googleMapRef.current);
            overlaysRef.current.push(overlay);
        });
    }, [simulationActive, simMetrics, selectedNode, onNodeSelect]);

    // Render mitigation bypass routes on the map
    useEffect(() => {
        if (!googleMapRef.current) return;

        polylinesRef.current.forEach(p => p.setMap(null));
        polylinesRef.current = [];

        if (!simulationActive) return;

        const [b1Route, b2Route] = UJJAIN_BACKUP_ROUTES;

        // Harifatak Outer Ring Diversion
        if (mitigationDiversion && b1Route) {
            const path = b1Route.pathCoordinates.map(c => ({ lat: c.lat, lng: c.lng }));
            const polyline = new google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#f97316',
                strokeOpacity: 0.9,
                strokeWeight: 5,
            });
            polyline.setMap(googleMapRef.current);
            polylinesRef.current.push(polyline);
        }

        // Dani Gate Catwalk Bypass
        if (mitigationBypass && b2Route) {
            const path = b2Route.pathCoordinates.map(c => ({ lat: c.lat, lng: c.lng }));
            const polyline = new google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#a78bfa',
                strokeOpacity: 0.9,
                strokeWeight: 5,
            });
            polyline.setMap(googleMapRef.current);
            polylinesRef.current.push(polyline);
        }
    }, [simulationActive, mitigationDiversion, mitigationBypass]);

    return (
        <div className="relative flex-1 h-screen overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />

            {/* Map Overlay Header Badge */}
            <div className="map-overlay-header">
                <span className="map-badge">
                    <span className={`map-badge-dot ${simulationActive ? 'active' : ''}`} />
                    {simulationActive ? 'SIMULATION ACTIVE' : 'LIVE GOOGLE MAPS TRAFFIC TELEMETRY'}
                </span>
                <span className="map-badge map-badge-coords">
                    UJJAIN SIMHASTHA ZONE · 23.18°N 75.77°E
                </span>
            </div>

            {/* VFR Crush Alert Overlay */}
            {simMetrics && simMetrics.vfr >= 1.25 && (
                <div className="vfr-alert-overlay">
                    <span className="vfr-alert-text">
                        ⚠ CRUSH THRESHOLD BREACHED — VFR {simMetrics.vfr.toFixed(2)} — ENGAGE MITIGATIONS
                    </span>
                </div>
            )}

            {/* Map Legend */}
            <div className="map-legend">
                <div className="legend-title">GEOSPATIAL CANVAS</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} />Nominal Flow</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} />Warning (VFR ≥ 0.85)</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} />CRUSH RISK (VFR ≥ 1.25)</div>
                {simulationActive && mitigationDiversion && (
                    <div className="legend-item"><span className="legend-line" style={{ background: '#f97316' }} />Harifatak Outer Ring</div>
                )}
                {simulationActive && mitigationBypass && (
                    <div className="legend-item"><span className="legend-line" style={{ background: '#a78bfa' }} />Dani Gate Catwalk</div>
                )}
            </div>
        </div>
    );
};

export const MapCanvas: React.FC<MapCanvasProps> = (props) => {
    return (
        <Wrapper apiKey={GOOGLE_MAPS_API_KEY}>
            <MapInner {...props} />
        </Wrapper>
    );
};
