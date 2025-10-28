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

const UJJAIN_CENTER: [number, number] = [23.1800, 75.7720];
const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

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

function buildMarkerHTML(node: LocationNode, sim: boolean, isSelected: boolean, ns?: any): string {
    const sel = isSelected ? 'outline:3px solid #22d3ee;outline-offset:3px;' : '';
    if (sim && ns) {
        const vfr = ns.vfr.toFixed(2);
        if (ns.status === 'danger') return `
<div style="position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center;">
  <div style="position:absolute;width:56px;height:56px;border-radius:50%;background:rgba(239,68,68,0.25);animation:crush-ping 1s ease-out infinite;"></div>
  <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(239,68,68,0.2);animation:crush-ping 1s ease-out infinite;animation-delay:0.4s;"></div>
  <div style="position:relative;width:30px;height:30px;border-radius:50%;background:#dc2626;border:2px solid #fca5a5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;box-shadow:0 0 18px rgba(239,68,68,0.9);${sel}">⚡</div>
  <div style="position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);background:rgba(69,10,10,0.97);border:1px solid #ef4444;color:#fca5a5;font-family:monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;white-space:nowrap;letter-spacing:0.05em;text-transform:uppercase;">CRUSH ${vfr}</div>
</div>`;
        if (ns.status === 'warning') return `
<div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
  <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(245,158,11,0.2);animation:crush-ping 1.2s ease-out infinite;"></div>
  <div style="position:relative;width:28px;height:28px;border-radius:50%;background:#d97706;border:2px solid #0f172a;display:flex;align-items:center;justify-content:center;color:#0f172a;font-size:13px;font-weight:700;box-shadow:0 0 12px rgba(245,158,11,0.7);${sel}">⚠</div>
  <div style="position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);background:rgba(120,53,15,0.97);border:1px solid #f59e0b;color:#fcd34d;font-family:monospace;font-size:9px;padding:2px 5px;border-radius:3px;white-space:nowrap;">WARN ${vfr}</div>
</div>`;
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
    const [engine, setEngine] = useState<'booting' | 'google' | 'leaflet'>('booting');

    // Google Maps refs
    const gMapRef = useRef<any>(null);
    const gOverlaysRef = useRef<any[]>([]);
    const gRoutesRef = useRef<any[]>([]);

    // Leaflet refs
    const lMapRef = useRef<L.Map | null>(null);
    const lMarkersRef = useRef<L.Marker[]>([]);
    const lRoutesRef = useRef<L.Polyline[]>([]);

    // ── Boot: try Google Maps via importLibrary, fall back to Leaflet ─────────
    useEffect(() => {
        let cancelled = false;

        const tryGoogle = async () => {
            try {
                // google.maps.importLibrary is registered by the bootstrap script in index.html
                const mapsLib: any = await (google as any).maps.importLibrary('maps');
                if (cancelled || !containerRef.current) return;

                const map = new mapsLib.Map(containerRef.current, {
                    center: { lat: UJJAIN_CENTER[0], lng: UJJAIN_CENTER[1] },
                    zoom: 14,
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    backgroundColor: '#070b13',
                });

                // Traffic layer — shows real-time green/yellow/red road overlays
                new mapsLib.TrafficLayer().setMap(map);

                gMapRef.current = map;
                if (!cancelled) setEngine('google');
            } catch (e) {
                console.warn('Google Maps failed, using Leaflet fallback:', e);
                if (!cancelled) initLeaflet();
            }
        };

        const initLeaflet = () => {
            if (!containerRef.current || lMapRef.current) return;
            const map = L.map(containerRef.current, {
                center: UJJAIN_CENTER,
                zoom: 14,
                zoomControl: false,
                attributionControl: false,
            });
            L.tileLayer(DARK_TILE, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            lMapRef.current = map;
            setEngine('leaflet');
            requestAnimationFrame(() => requestAnimationFrame(() => map.invalidateSize()));
        };

        // Wait for the bootstrap loader to register importLibrary (≤2s)
        const waitForGoogle = () => {
            if (typeof google !== 'undefined' && google?.maps?.importLibrary) {
                tryGoogle();
            } else if (!cancelled) {
                setTimeout(waitForGoogle, 150);
            }
        };

        // Fallback to Leaflet after 3s if Google never loads
        const fallbackTimer = setTimeout(() => {
            if (!gMapRef.current && !lMapRef.current) initLeaflet();
        }, 3000);

        waitForGoogle();

        return () => {
            cancelled = true;
            clearTimeout(fallbackTimer);
        };
    }, []);

    // ── Render markers ────────────────────────────────────────────────────────
    useEffect(() => {
        if (engine === 'booting') return;

        // GOOGLE MAPS markers
        if (engine === 'google' && gMapRef.current) {
            gOverlaysRef.current.forEach(o => o.setMap(null));
            gOverlaysRef.current = [];

            class CustomOverlay extends google.maps.OverlayView {
                el: HTMLElement; pos: any;
                constructor(pos: any, el: HTMLElement) { super(); this.pos = pos; this.el = el; }
                onAdd() { this.getPanes()!.overlayMouseTarget.appendChild(this.el); }
                draw() {
                    const pt = this.getProjection().fromLatLngToDivPixel(this.pos);
                    if (pt) { this.el.style.cssText += `left:${pt.x}px;top:${pt.y}px;position:absolute;transform:translate(-50%,-50%);cursor:pointer;z-index:10;`; }
                }
                onRemove() { this.el.parentNode?.removeChild(this.el); }
            }

            UJJAIN_LOCATIONS.forEach(node => {
                const ns = simMetrics?.nodes[node.id];
                const isSelected = selectedNode?.id === node.id;
                const el = document.createElement('div');
                el.innerHTML = buildMarkerHTML(node, simulationActive, isSelected, ns);
                el.onclick = (e) => { e.stopPropagation(); onNodeSelect(node); };
                const o = new CustomOverlay(new google.maps.LatLng(node.lat, node.lng), el);
                o.setMap(gMapRef.current);
                gOverlaysRef.current.push(o);
            });
        }

        // LEAFLET markers
        if (engine === 'leaflet' && lMapRef.current) {
            lMarkersRef.current.forEach(m => m.remove());
            lMarkersRef.current = [];
            UJJAIN_LOCATIONS.forEach(node => {
                const ns = simMetrics?.nodes[node.id];
                const isSelected = selectedNode?.id === node.id;
                const html = buildMarkerHTML(node, simulationActive, isSelected, ns);
                const icon = L.divIcon({
                    className: '',
                    html: `<style>@keyframes crush-ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.2);opacity:0}}</style>${html}`,
                    iconSize: [56, 56], iconAnchor: [28, 28],
                });
                const marker = L.marker([node.lat, node.lng], { icon }).addTo(lMapRef.current!);
                marker.on('click', () => onNodeSelect(node));
                lMarkersRef.current.push(marker);
            });
            lMapRef.current.invalidateSize();
        }
    }, [engine, simulationActive, simMetrics, selectedNode, onNodeSelect]);

    // ── Render bypass routes ──────────────────────────────────────────────────
    useEffect(() => {
        if (engine === 'booting') return;
        const [b1, b2] = UJJAIN_BACKUP_ROUTES;

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

        if (engine === 'leaflet' && lMapRef.current) {
            lRoutesRef.current.forEach(p => p.remove());
            lRoutesRef.current = [];
            if (simulationActive && mitigationDiversion && b1)
                lRoutesRef.current.push(L.polyline(b1.pathCoordinates.map(c => [c.lat, c.lng] as [number, number]), { color: '#f97316', weight: 5, dashArray: '10,5' }).addTo(lMapRef.current!));
            if (simulationActive && mitigationBypass && b2)
                lRoutesRef.current.push(L.polyline(b2.pathCoordinates.map(c => [c.lat, c.lng] as [number, number]), { color: '#a78bfa', weight: 5, dashArray: '8,4' }).addTo(lMapRef.current!));
        }
    }, [engine, simulationActive, mitigationDiversion, mitigationBypass]);

    return (
        <div style={{ position: 'relative', flex: 1, height: '100vh', overflow: 'hidden', background: '#070b13', minWidth: 0 }}>
            {/* Spinning boot indicator */}
            {engine === 'booting' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 50 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid #22d3ee', borderTopColor: 'transparent', borderRadius: '50%', animation: 'gmaps-spin 1s linear infinite' }} />
                    <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em' }}>LOADING GOOGLE MAPS…</span>
                    <style>{`@keyframes gmaps-spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            )}

            {/* Map container — explicit size, no Tailwind */}
            <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '100vh', display: engine === 'booting' ? 'none' : 'block' }} />

            {/* Header badge */}
            <div className="map-overlay-header">
                <span className="map-badge">
                    <span className={`map-badge-dot ${simulationActive ? 'active' : ''}`} />
                    {engine === 'google' ? (simulationActive ? 'SIMULATION ACTIVE · GOOGLE MAPS' : 'LIVE TRAFFIC · GOOGLE MAPS') : (simulationActive ? 'SIMULATION ACTIVE' : 'LIVE TRANSIT COMMAND')}
                </span>
                <span className="map-badge map-badge-coords">UJJAIN SIMHASTHA ZONE · 23.18°N 75.77°E</span>
            </div>

            {/* Crush alert */}
            {simMetrics && simMetrics.vfr >= 1.25 && (
                <div className="vfr-alert-overlay">
                    <span className="vfr-alert-text">⚠ CRUSH THRESHOLD BREACHED — VFR {simMetrics.vfr.toFixed(2)} — ENGAGE MITIGATIONS</span>
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
