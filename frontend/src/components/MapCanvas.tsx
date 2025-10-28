import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
          <div class="absolute -bottom-8 bg-red-950 border border-red-500 text-red-300 font-mono font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap shadow-lg tracking-wider uppercase z-30">
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
          <div class="absolute -bottom-7 bg-amber-950 border border-amber-500/60 text-amber-300 font-mono px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap shadow-md z-30">
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
        <div class="absolute -bottom-6 bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap z-30">
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
      <div class="absolute -bottom-6 bg-slate-950 border border-slate-700 text-slate-200 font-sans px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap shadow z-30">
        ${node.name.split(' ')[0]}
      </div>
    </div>
  `;
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
    simulationActive,
    mitigationDiversion,
    mitigationBypass,
    simMetrics,
    selectedNode,
    onNodeSelect,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [engine, setEngine] = useState<'google' | 'leaflet'>('leaflet');
    
    // Leaflet refs
    const leafletMapRef = useRef<L.Map | null>(null);
    const leafletMarkersRef = useRef<L.Marker[]>([]);
    const leafletRoutesRef = useRef<L.Polyline[]>([]);

    // Google Maps refs
    const googleMapRef = useRef<any>(null);
    const googleOverlaysRef = useRef<any[]>([]);
    const googleRoutesRef = useRef<any[]>([]);

    // Load Google Maps script dynamically and check availability
    useEffect(() => {
        let isMounted = true;
        const scriptId = 'google-maps-sdk';

        const initGoogleMaps = () => {
            if (!containerRef.current || !(window as any).google?.maps) return false;
            try {
                const ujjainCenter = { lat: 23.1800, lng: 75.7720 };
                const map = new google.maps.Map(containerRef.current, {
                    center: ujjainCenter,
                    zoom: 14,
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    backgroundColor: '#070b13',
                });
                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);
                googleMapRef.current = map;
                if (isMounted) setEngine('google');
                return true;
            } catch (e) {
                console.warn('Google Maps init failed, falling back to Leaflet', e);
                return false;
            }
        };

        if ((window as any).google?.maps) {
            initGoogleMaps();
        } else if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
            script.async = true;
            script.onload = () => {
                setTimeout(() => {
                    if (!initGoogleMaps()) initLeaflet();
                }, 300);
            };
            script.onerror = () => {
                initLeaflet();
            };
            document.head.appendChild(script);
        } else {
            const timer = setTimeout(() => {
                if (!initGoogleMaps()) initLeaflet();
            }, 1000);
            return () => clearTimeout(timer);
        }

        function initLeaflet() {
            if (!containerRef.current || leafletMapRef.current || googleMapRef.current) return;
            const map = L.map(containerRef.current, {
                center: [23.1800, 75.7720],
                zoom: 14,
                zoomControl: false,
                attributionControl: false,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd',
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);
            leafletMapRef.current = map;
            if (isMounted) setEngine('leaflet');

            // Force resize trigger for proper tile display
            setTimeout(() => map.invalidateSize(), 200);
        }

        // Fallback safety timeout if Google script hangs
        const fallbackTimer = setTimeout(() => {
            if (!googleMapRef.current && !leafletMapRef.current) {
                initLeaflet();
            }
        }, 2000);

        return () => {
            isMounted = false;
            clearTimeout(fallbackTimer);
        };
    }, []);

    // Render Markers & Overlays
    useEffect(() => {
        // --- GOOGLE MAPS RENDER ---
        if (engine === 'google' && googleMapRef.current) {
            googleOverlaysRef.current.forEach(o => o.setMap(null));
            googleOverlaysRef.current = [];

            class CustomOverlay extends google.maps.OverlayView {
                private el: HTMLElement;
                private pos: any;
                constructor(pos: any, el: HTMLElement) {
                    super(); this.pos = pos; this.el = el;
                }
                onAdd() { this.getPanes()?.overlayMouseTarget?.appendChild(this.el); }
                draw() {
                    const pr = this.getProjection();
                    if (!pr) return;
                    const pt = pr.fromLatLngToDivPixel(this.pos);
                    if (pt) {
                        this.el.style.left = `${pt.x}px`;
                        this.el.style.top = `${pt.y}px`;
                        this.el.style.position = 'absolute';
                        this.el.style.transform = 'translate(-50%, -50%)';
                        this.el.style.cursor = 'pointer';
                    }
                }
                onRemove() { this.el.parentNode?.removeChild(this.el); }
            }

            UJJAIN_LOCATIONS.forEach(node => {
                const isSelected = selectedNode?.id === node.id;
                const nodeStatus = simMetrics?.nodes[node.id];
                const el = document.createElement('div');
                el.innerHTML = compileMarkerHTML(node, simulationActive, isSelected, nodeStatus);
                el.onclick = () => onNodeSelect(node);

                const overlay = new CustomOverlay(new google.maps.LatLng(node.lat, node.lng), el);
                overlay.setMap(googleMapRef.current);
                googleOverlaysRef.current.push(overlay);
            });
        }

        // --- LEAFLET RENDER ---
        if (engine === 'leaflet' && leafletMapRef.current) {
            const map = leafletMapRef.current;
            leafletMarkersRef.current.forEach(m => m.remove());
            leafletMarkersRef.current = [];

            UJJAIN_LOCATIONS.forEach(node => {
                const isSelected = selectedNode?.id === node.id;
                const nodeStatus = simMetrics?.nodes[node.id];
                const html = compileMarkerHTML(node, simulationActive, isSelected, nodeStatus);
                const icon = L.divIcon({ className: '', html, iconSize: [36, 36], iconAnchor: [18, 18] });
                const marker = L.marker([node.lat, node.lng], { icon }).addTo(map);
                marker.on('click', () => onNodeSelect(node));
                leafletMarkersRef.current.push(marker);
            });

            map.invalidateSize();
        }
    }, [engine, simulationActive, simMetrics, selectedNode, onNodeSelect]);

    // Render Routes
    useEffect(() => {
        if (!simulationActive) {
            googleRoutesRef.current.forEach(p => p.setMap(null));
            googleRoutesRef.current = [];
            leafletRoutesRef.current.forEach(p => p.remove());
            leafletRoutesRef.current = [];
            return;
        }

        const [b1Route, b2Route] = UJJAIN_BACKUP_ROUTES;

        // GOOGLE MAPS ROUTES
        if (engine === 'google' && googleMapRef.current) {
            googleRoutesRef.current.forEach(p => p.setMap(null));
            googleRoutesRef.current = [];

            if (mitigationDiversion && b1Route) {
                const poly = new google.maps.Polyline({
                    path: b1Route.pathCoordinates.map(c => ({ lat: c.lat, lng: c.lng })),
                    strokeColor: '#f97316', strokeOpacity: 0.9, strokeWeight: 5,
                });
                poly.setMap(googleMapRef.current);
                googleRoutesRef.current.push(poly);
            }
            if (mitigationBypass && b2Route) {
                const poly = new google.maps.Polyline({
                    path: b2Route.pathCoordinates.map(c => ({ lat: c.lat, lng: c.lng })),
                    strokeColor: '#a78bfa', strokeOpacity: 0.9, strokeWeight: 5,
                });
                poly.setMap(googleMapRef.current);
                googleRoutesRef.current.push(poly);
            }
        }

        // LEAFLET ROUTES
        if (engine === 'leaflet' && leafletMapRef.current) {
            leafletRoutesRef.current.forEach(p => p.remove());
            leafletRoutesRef.current = [];

            if (mitigationDiversion && b1Route) {
                const poly = L.polyline(b1Route.pathCoordinates.map(c => [c.lat, c.lng]), {
                    color: '#f97316', weight: 4, dashArray: '10, 6'
                }).addTo(leafletMapRef.current);
                leafletRoutesRef.current.push(poly);
            }
            if (mitigationBypass && b2Route) {
                const poly = L.polyline(b2Route.pathCoordinates.map(c => [c.lat, c.lng]), {
                    color: '#a78bfa', weight: 4, dashArray: '8, 4'
                }).addTo(leafletMapRef.current);
                leafletRoutesRef.current.push(poly);
            }
        }
    }, [engine, simulationActive, mitigationDiversion, mitigationBypass]);

    return (
        <div className="relative flex-1 h-screen overflow-hidden bg-[#070b13]">
            <div ref={containerRef} className="w-full h-full min-h-[500px]" style={{ minHeight: '100vh', width: '100%' }} />

            {/* Header Badge */}
            <div className="map-overlay-header">
                <span className="map-badge">
                    <span className={`map-badge-dot ${simulationActive ? 'active' : ''}`} />
                    {simulationActive ? 'SIMULATION ACTIVE' : `LIVE TRANSIT COMMAND (${engine.toUpperCase()})`}
                </span>
                <span className="map-badge map-badge-coords">
                    UJJAIN SIMHASTHA ZONE · 23.18°N 75.77°E
                </span>
            </div>

            {/* VFR Alert */}
            {simMetrics && simMetrics.vfr >= 1.25 && (
                <div className="vfr-alert-overlay">
                    <span className="vfr-alert-text">
                        ⚠ CRUSH THRESHOLD BREACHED — VFR {simMetrics.vfr.toFixed(2)} — ENGAGE MITIGATIONS
                    </span>
                </div>
            )}

            {/* Legend */}
            <div className="map-legend">
                <div className="legend-title">GEOSPATIAL COMMAND</div>
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
