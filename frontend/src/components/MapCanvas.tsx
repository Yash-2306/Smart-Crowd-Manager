import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationNode } from '../data/keyinfo';
import { UJJAIN_LOCATIONS, UJJAIN_BACKUP_ROUTES } from '../data/keyinfo';
import type { SimMetrics } from '../data/simulationEngine';

declare const google: any;

interface MapCanvasProps {
    simulationActive: boolean;
    mitigationDiversion: boolean;
    mitigationBypass: boolean;
    simMetrics: SimMetrics | null;
    selectedNode: LocationNode | null;
    onNodeSelect: (node: LocationNode) => void;
}

const UJJAIN_CENTER = { lat: 23.1800, lng: 75.7720 };

const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f19' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0b1329' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#334155' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0b1329' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070b13' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
];

const compileMarkerHTML = (node: LocationNode, isSimulationActive: boolean, isSelected: boolean, nodeStatus?: any) => {
    const ring = isSelected ? 'outline: 3px solid #22d3ee; outline-offset: 3px;' : '';

    if (isSimulationActive && nodeStatus) {
        const vfr = nodeStatus.vfr.toFixed(2);
        if (nodeStatus.status === 'danger') {
            return `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;width:48px;height:48px;background:rgba(239,68,68,0.3);border-radius:50%;animation:ping 1s cubic-bezier(0,0,.2,1) infinite;"></div>
              <div style="position:absolute;width:72px;height:72px;background:rgba(239,68,68,0.15);border-radius:50%;animation:ping 1s cubic-bezier(0,0,.2,1) infinite;animation-delay:0.3s;"></div>
              <div style="position:relative;width:32px;height:32px;background:#dc2626;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;color:#fff;font-weight:700;font-size:13px;box-shadow:0 0 16px rgba(239,68,68,0.8);${ring}">⚡</div>
              <div style="position:absolute;bottom:-28px;background:rgba(69,10,10,0.95);border:1px solid #ef4444;color:#fca5a5;font-family:monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;letter-spacing:0.06em;text-transform:uppercase;">CRUSH VFR:${vfr}</div>
            </div>`;
        }
        if (nodeStatus.status === 'warning') {
            return `
            <div style="position:relative;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;width:40px;height:40px;background:rgba(245,158,11,0.3);border-radius:50%;animation:ping 1s cubic-bezier(0,0,.2,1) infinite;"></div>
              <div style="position:relative;width:28px;height:28px;background:#d97706;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #0f172a;color:#0f172a;font-weight:700;font-size:12px;box-shadow:0 0 10px rgba(245,158,11,0.6);${ring}">⚠</div>
              <div style="position:absolute;bottom:-24px;background:rgba(120,53,15,0.95);border:1px solid #f59e0b;color:#fcd34d;font-family:monospace;font-size:9px;padding:2px 5px;border-radius:3px;white-space:nowrap;">WARN ${vfr}</div>
            </div>`;
        }
        return `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:relative;width:24px;height:24px;background:#059669;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid #34d399;color:#fff;font-size:10px;${ring}">✓</div>
          <div style="position:absolute;bottom:-22px;background:rgba(6,27,6,0.9);border:1px solid rgba(16,185,129,0.4);color:#34d399;font-family:monospace;font-size:8px;padding:2px 4px;border-radius:3px;white-space:nowrap;">${vfr}</div>
        </div>`;
    }

    const icons: Record<string, string> = { transit: '🚂', epicenter: '⛩', holding: '🅿', chokepoint: '⚡' };
    return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;">
      <div style="width:30px;height:30px;background:#0f172a;border:2px solid #22d3ee;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 10px rgba(34,211,238,0.3);${ring}">${icons[node.type] || '📍'}</div>
      <div style="position:absolute;bottom:-22px;background:rgba(2,6,23,0.9);border:1px solid #1e293b;color:#cbd5e1;font-size:9px;padding:2px 5px;border-radius:3px;white-space:nowrap;">${node.name.split(' ')[0]}</div>
    </div>`;
};

// Google Maps Custom Overlay class factory
function createOverlayClass() {
    class CustomOverlay extends google.maps.OverlayView {
        el: HTMLElement;
        pos: any;
        constructor(pos: any, el: HTMLElement) {
            super();
            this.pos = pos;
            this.el = el;
        }
        onAdd() { this.getPanes()!.overlayMouseTarget.appendChild(this.el); }
        draw() {
            const pt = this.getProjection().fromLatLngToDivPixel(this.pos);
            if (pt) {
                this.el.style.cssText += `left:${pt.x}px;top:${pt.y}px;position:absolute;transform:translate(-50%,-50%);cursor:pointer;z-index:10;`;
            }
        }
        onRemove() { this.el.parentNode?.removeChild(this.el); }
    }
    return CustomOverlay;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
    simulationActive,
    mitigationDiversion,
    mitigationBypass,
    simMetrics,
    selectedNode,
    onNodeSelect,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [engine, setEngine] = useState<'waiting' | 'google' | 'leaflet'>('waiting');

    // Google Maps refs
    const gMapRef = useRef<any>(null);
    const gOverlaysRef = useRef<any[]>([]);
    const gRoutesRef = useRef<any[]>([]);

    // Leaflet refs
    const lMapRef = useRef<L.Map | null>(null);
    const lMarkersRef = useRef<L.Marker[]>([]);
    const lRoutesRef = useRef<L.Polyline[]>([]);

    // ── Step 1: Decide which engine to use ──────────────────────────────────
    useEffect(() => {
        let attempts = 0;
        const MAX = 30; // 3 seconds

        const timer = setInterval(() => {
            attempts++;
            const g = (window as any).google;
            if (g?.maps?.Map) {
                clearInterval(timer);
                setEngine('google');
            } else if (attempts >= MAX) {
                clearInterval(timer);
                setEngine('leaflet');
            }
        }, 100);

        return () => clearInterval(timer);
    }, []);

    // ── Step 2: Initialize the chosen map engine ─────────────────────────────
    useEffect(() => {
        if (engine === 'waiting' || !containerRef.current) return;

        if (engine === 'google' && !gMapRef.current) {
            try {
                const map = new google.maps.Map(containerRef.current, {
                    center: UJJAIN_CENTER,
                    zoom: 14,
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    backgroundColor: '#070b13',
                });
                // Mount traffic layer
                new google.maps.TrafficLayer().setMap(map);
                gMapRef.current = map;
            } catch (e) {
                console.error('Google Maps init failed:', e);
                setEngine('leaflet'); // fall through to leaflet
            }
        }

        if (engine === 'leaflet' && !lMapRef.current) {
            const map = L.map(containerRef.current, {
                center: [UJJAIN_CENTER.lat, UJJAIN_CENTER.lng],
                zoom: 14,
                zoomControl: false,
                attributionControl: false,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd',
            }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            lMapRef.current = map;
            setTimeout(() => map.invalidateSize(), 250);
        }
    }, [engine]);

    // ── Step 3: Render markers ───────────────────────────────────────────────
    useEffect(() => {
        if (engine === 'waiting') return;

        // Google
        if (engine === 'google' && gMapRef.current) {
            gOverlaysRef.current.forEach(o => o.setMap(null));
            gOverlaysRef.current = [];
            const CustomOverlay = createOverlayClass();
            UJJAIN_LOCATIONS.forEach(node => {
                const nodeStatus = simMetrics?.nodes[node.id];
                const isSelected = selectedNode?.id === node.id;
                const el = document.createElement('div');
                el.innerHTML = compileMarkerHTML(node, simulationActive, isSelected, nodeStatus);
                el.addEventListener('click', (e) => { e.stopPropagation(); onNodeSelect(node); });
                const overlay = new CustomOverlay(new google.maps.LatLng(node.lat, node.lng), el);
                overlay.setMap(gMapRef.current);
                gOverlaysRef.current.push(overlay);
            });
        }

        // Leaflet
        if (engine === 'leaflet' && lMapRef.current) {
            lMarkersRef.current.forEach(m => m.remove());
            lMarkersRef.current = [];
            UJJAIN_LOCATIONS.forEach(node => {
                const nodeStatus = simMetrics?.nodes[node.id];
                const isSelected = selectedNode?.id === node.id;
                const html = compileMarkerHTML(node, simulationActive, isSelected, nodeStatus);
                const icon = L.divIcon({ className: '', html, iconSize: [36, 36], iconAnchor: [18, 18] });
                const marker = L.marker([node.lat, node.lng], { icon }).addTo(lMapRef.current!);
                marker.on('click', () => onNodeSelect(node));
                lMarkersRef.current.push(marker);
            });
            lMapRef.current.invalidateSize();
        }
    }, [engine, simulationActive, simMetrics, selectedNode, onNodeSelect]);

    // ── Step 4: Render routes ────────────────────────────────────────────────
    useEffect(() => {
        if (engine === 'waiting') return;
        const [b1, b2] = UJJAIN_BACKUP_ROUTES;

        // Google
        if (engine === 'google' && gMapRef.current) {
            gRoutesRef.current.forEach(p => p.setMap(null));
            gRoutesRef.current = [];
            if (simulationActive && mitigationDiversion && b1) {
                const p = new google.maps.Polyline({ path: b1.pathCoordinates.map(c => ({ lat: c.lat, lng: c.lng })), strokeColor: '#f97316', strokeOpacity: 0.9, strokeWeight: 5 });
                p.setMap(gMapRef.current); gRoutesRef.current.push(p);
            }
            if (simulationActive && mitigationBypass && b2) {
                const p = new google.maps.Polyline({ path: b2.pathCoordinates.map(c => ({ lat: c.lat, lng: c.lng })), strokeColor: '#a78bfa', strokeOpacity: 0.9, strokeWeight: 5 });
                p.setMap(gMapRef.current); gRoutesRef.current.push(p);
            }
        }

        // Leaflet
        if (engine === 'leaflet' && lMapRef.current) {
            lRoutesRef.current.forEach(p => p.remove());
            lRoutesRef.current = [];
            if (simulationActive && mitigationDiversion && b1) {
                lRoutesRef.current.push(L.polyline(b1.pathCoordinates.map(c => [c.lat, c.lng] as [number, number]), { color: '#f97316', weight: 4, dashArray: '10,6' }).addTo(lMapRef.current!));
            }
            if (simulationActive && mitigationBypass && b2) {
                lRoutesRef.current.push(L.polyline(b2.pathCoordinates.map(c => [c.lat, c.lng] as [number, number]), { color: '#a78bfa', weight: 4, dashArray: '8,4' }).addTo(lMapRef.current!));
            }
        }
    }, [engine, simulationActive, mitigationDiversion, mitigationBypass]);

    return (
        <div className="relative flex-1 overflow-hidden" style={{ height: '100vh', background: '#070b13' }}>
            {/* CSS keyframes for ping animation in markers */}
            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>

            {engine === 'waiting' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b13', zIndex: 100, flexDirection: 'column', gap: 12 }}>
                    <div style={{ width: 40, height: 40, border: '3px solid #22d3ee', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING GEOSPATIAL CANVAS…</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            <div
                ref={containerRef}
                style={{ width: '100%', height: '100%', visibility: engine === 'waiting' ? 'hidden' : 'visible' }}
            />

            {/* Overlay header */}
            <div className="map-overlay-header">
                <span className="map-badge">
                    <span className={`map-badge-dot ${simulationActive ? 'active' : ''}`} />
                    {simulationActive ? 'SIMULATION ACTIVE' : engine === 'google' ? 'GOOGLE MAPS · LIVE TRAFFIC' : 'COMMAND CANVAS · LIVE FEED'}
                </span>
                <span className="map-badge map-badge-coords">
                    UJJAIN SIMHASTHA ZONE · 23.18°N 75.77°E
                </span>
            </div>

            {simMetrics && simMetrics.vfr >= 1.25 && (
                <div className="vfr-alert-overlay">
                    <span className="vfr-alert-text">
                        ⚠ CRUSH THRESHOLD BREACHED — VFR {simMetrics.vfr.toFixed(2)} — ENGAGE MITIGATIONS
                    </span>
                </div>
            )}

            <div className="map-legend">
                <div className="legend-title">NODE STATUS</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} />Nominal</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} />Warning (≥ 0.85)</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} />CRUSH (≥ 1.25)</div>
                {simulationActive && mitigationDiversion && <div className="legend-item"><span className="legend-line" style={{ background: '#f97316' }} />Harifatak Ring</div>}
                {simulationActive && mitigationBypass && <div className="legend-item"><span className="legend-line" style={{ background: '#a78bfa' }} />Dani Gate Bypass</div>}
            </div>
        </div>
    );
};
