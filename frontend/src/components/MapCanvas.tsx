import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationNode } from '../data/keyinfo';
import { UJJAIN_LOCATIONS, UJJAIN_BACKUP_ROUTES } from '../data/keyinfo';
import type { SimMetrics } from '../data/simulationEngine';

interface MapCanvasProps {
    simulationActive: boolean;
    mitigationDiversion: boolean;
    mitigationBypass: boolean;
    simMetrics: SimMetrics | null;
    selectedNode: LocationNode | null;
    onNodeSelect: (node: LocationNode) => void;
}

const UJJAIN_CENTER: [number, number] = [23.1800, 75.7720];

// Dark CartoDB tile — matches the reference demo's dark vector aesthetic
const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function buildMarkerHTML(node: LocationNode, sim: boolean, isSelected: boolean, ns?: any): string {
    const sel = isSelected ? 'outline:3px solid #22d3ee;outline-offset:3px;' : '';

    if (sim && ns) {
        const vfr = ns.vfr.toFixed(2);

        if (ns.status === 'danger') {
            return `
<div style="position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center;">
  <div style="position:absolute;width:56px;height:56px;border-radius:50%;background:rgba(239,68,68,0.25);animation:crush-ping 1s ease-out infinite;"></div>
  <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(239,68,68,0.2);animation:crush-ping 1s ease-out infinite;animation-delay:0.4s;"></div>
  <div style="position:relative;width:30px;height:30px;border-radius:50%;background:#dc2626;border:2px solid #fca5a5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;box-shadow:0 0 18px rgba(239,68,68,0.9);${sel}">⚡</div>
  <div style="position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);background:rgba(69,10,10,0.97);border:1px solid #ef4444;color:#fca5a5;font-family:monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;letter-spacing:0.05em;text-transform:uppercase;">CRUSH ${vfr}</div>
</div>`;
        }

        if (ns.status === 'warning') {
            return `
<div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
  <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(245,158,11,0.2);animation:crush-ping 1.2s ease-out infinite;"></div>
  <div style="position:relative;width:28px;height:28px;border-radius:50%;background:#d97706;border:2px solid #0f172a;display:flex;align-items:center;justify-content:center;color:#0f172a;font-size:13px;font-weight:700;box-shadow:0 0 12px rgba(245,158,11,0.7);${sel}">⚠</div>
  <div style="position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);background:rgba(120,53,15,0.97);border:1px solid #f59e0b;color:#fcd34d;font-family:monospace;font-size:9px;padding:2px 5px;border-radius:3px;white-space:nowrap;">WARN ${vfr}</div>
</div>`;
        }

        return `
<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
  <div style="position:relative;width:24px;height:24px;border-radius:50%;background:#059669;border:1px solid #34d399;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;box-shadow:0 0 8px rgba(16,185,129,0.5);${sel}">✓</div>
  <div style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);background:rgba(2,44,2,0.95);border:1px solid rgba(16,185,129,0.4);color:#34d399;font-family:monospace;font-size:8px;padding:2px 4px;border-radius:3px;white-space:nowrap;">${vfr}</div>
</div>`;
    }

    const icons: Record<string, string> = { transit: '🚂', epicenter: '⛩', holding: '🅿', chokepoint: '⚡' };
    return `
<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
  <div style="width:32px;height:32px;border-radius:50%;background:#0f172a;border:2px solid #22d3ee;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 12px rgba(34,211,238,0.35);${sel}">${icons[node.type] || '📍'}</div>
  <div style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);background:rgba(2,6,23,0.95);border:1px solid #1e293b;color:#cbd5e1;font-family:sans-serif;font-size:9px;padding:2px 5px;border-radius:3px;white-space:nowrap;">${node.name.split(' ')[0]}</div>
</div>`;
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
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const routesRef = useRef<L.Polyline[]>([]);

    // ── Init Leaflet map once ─────────────────────────────────────────────────
    useEffect(() => {
        if (mapRef.current || !containerRef.current) return;

        const map = L.map(containerRef.current, {
            center: UJJAIN_CENTER,
            zoom: 14,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer(DARK_TILE, {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '© CartoDB © OpenStreetMap',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.control.attribution({ position: 'bottomleft', prefix: '' })
            .addTo(map)
            .addAttribution('© CartoDB');

        mapRef.current = map;

        // Must call invalidateSize after a frame to prevent grey tiles
        requestAnimationFrame(() => {
            requestAnimationFrame(() => map.invalidateSize());
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // ── Re-render markers on state change ────────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        UJJAIN_LOCATIONS.forEach(node => {
            const ns = simMetrics?.nodes[node.id];
            const isSelected = selectedNode?.id === node.id;
            const html = buildMarkerHTML(node, simulationActive, isSelected, ns);

            const icon = L.divIcon({
                className: '',
                html: `<style>
                    @keyframes crush-ping {
                        0%   { transform: scale(1);   opacity: 0.8; }
                        100% { transform: scale(2.2); opacity: 0;   }
                    }
                </style>${html}`,
                iconSize: [56, 56],
                iconAnchor: [28, 28],
            });

            const marker = L.marker([node.lat, node.lng], { icon }).addTo(map);
            marker.on('click', () => onNodeSelect(node));

            // Dark popup
            const status = ns ? `VFR: ${ns.vfr.toFixed(2)} · ${ns.status.toUpperCase()}` : `Cap: ${node.maxCapacityPedestrians.toLocaleString()}`;
            marker.bindPopup(`
                <div style="font-family:sans-serif;min-width:200px;">
                    <div style="font-weight:700;color:#e2e8f0;font-size:13px;margin-bottom:4px;">${node.name}</div>
                    <div style="font-size:10px;color:#38bdf8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">${node.type}</div>
                    <div style="font-size:11px;font-family:monospace;color:#94a3b8;margin-bottom:8px;">${status}</div>
                    <div style="font-size:10px;color:#64748b;line-height:1.5;border-top:1px solid #1e293b;padding-top:6px;">${node.onGroundRiskFactor}</div>
                </div>
            `, { className: 'dark-popup', maxWidth: 280 });

            markersRef.current.push(marker);
        });

        map.invalidateSize();
    }, [simulationActive, simMetrics, selectedNode, onNodeSelect]);

    // ── Render routes when mitigations toggle ─────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        routesRef.current.forEach(p => p.remove());
        routesRef.current = [];

        if (!simulationActive) return;

        const [b1, b2] = UJJAIN_BACKUP_ROUTES;

        if (mitigationDiversion && b1) {
            routesRef.current.push(
                L.polyline(b1.pathCoordinates.map(c => [c.lat, c.lng] as [number, number]), {
                    color: '#f97316', weight: 5, opacity: 0.9, dashArray: '10,5',
                })
                    .addTo(map)
                    .bindTooltip(`<b>${b1.name}</b><br>${b1.strategicAdvantage}`, { sticky: true })
            );
        }

        if (mitigationBypass && b2) {
            routesRef.current.push(
                L.polyline(b2.pathCoordinates.map(c => [c.lat, c.lng] as [number, number]), {
                    color: '#a78bfa', weight: 5, opacity: 0.9, dashArray: '8,4',
                })
                    .addTo(map)
                    .bindTooltip(`<b>${b2.name}</b><br>${b2.strategicAdvantage}`, { sticky: true })
            );
        }
    }, [simulationActive, mitigationDiversion, mitigationBypass]);

    return (
        // All sizing via explicit inline styles — zero Tailwind dependency
        <div style={{
            position: 'relative',
            flex: 1,
            height: '100vh',
            overflow: 'hidden',
            background: '#070b13',
            minWidth: 0,      // prevents flex child from overflowing
        }}>
            {/* The Leaflet mount target — must have explicit pixel-independent size */}
            <div
                ref={containerRef}
                style={{ width: '100%', height: '100%', minHeight: '100vh' }}
            />

            {/* Overlay header */}
            <div className="map-overlay-header">
                <span className="map-badge">
                    <span className={`map-badge-dot ${simulationActive ? 'active' : ''}`} />
                    {simulationActive ? 'SIMULATION ACTIVE' : 'LIVE TRANSIT COMMAND · UJJAIN'}
                </span>
                <span className="map-badge map-badge-coords">
                    23.18°N 75.77°E · SIMHASTHA ZONE
                </span>
            </div>

            {/* VFR Crush Alert */}
            {simMetrics && simMetrics.vfr >= 1.25 && (
                <div className="vfr-alert-overlay">
                    <span className="vfr-alert-text">
                        ⚠ CRUSH THRESHOLD BREACHED — VFR {simMetrics.vfr.toFixed(2)} — ENGAGE MITIGATIONS
                    </span>
                </div>
            )}

            {/* Legend */}
            <div className="map-legend">
                <div className="legend-title">NODE STATUS</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} />Nominal</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} />Warning ≥ 0.85</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} />CRUSH ≥ 1.25</div>
                {simulationActive && mitigationDiversion && <div className="legend-item"><span className="legend-line" style={{ background: '#f97316' }} />Harifatak Ring</div>}
                {simulationActive && mitigationBypass && <div className="legend-item"><span className="legend-line" style={{ background: '#a78bfa' }} />Dani Gate Bypass</div>}
            </div>
        </div>
    );
};
