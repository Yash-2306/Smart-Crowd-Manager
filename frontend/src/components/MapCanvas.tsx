import React, { useEffect, useRef, useState } from 'react';
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

// Custom dark tile layer
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const getNodeColor = (node: LocationNode, simMetrics: SimMetrics | null): string => {
    if (!simMetrics) {
        const typeColors: Record<string, string> = {
            transit: '#38bdf8',
            epicenter: '#a78bfa',
            holding: '#34d399',
            chokepoint: '#fb923c',
        };
        return typeColors[node.type] || '#94a3b8';
    }
    const status = simMetrics.nodes[node.id]?.status;
    if (status === 'danger') return '#ef4444';
    if (status === 'warning') return '#f59e0b';
    return '#10b981';
};

const getNodeIcon = (node: LocationNode, simMetrics: SimMetrics | null, isSelected: boolean): L.DivIcon => {
    const color = getNodeColor(node, simMetrics);
    const nodeStatus = simMetrics?.nodes[node.id];
    const status = nodeStatus?.status || 'nominal';
    const isDanger = status === 'danger';
    const isWarning = status === 'warning';

    const pulseRing = isDanger
        ? `<div class="node-pulse-danger"></div>`
        : isWarning ? `<div class="node-pulse-warning"></div>` : '';

    const label = nodeStatus
        ? `<div class="node-label" style="background:${isDanger ? 'rgba(127,29,29,0.95)' : isWarning ? 'rgba(120,53,15,0.95)' : 'rgba(6,27,6,0.95)'}; border-color:${color}; color:${color};">
            ${isDanger ? '⚠ CRUSH' : isWarning ? '⚠ WARN' : '✓ OK'} (VFR:${nodeStatus.vfr.toFixed(2)})
           </div>`
        : '';

    return L.divIcon({
        className: '',
        html: `<div class="node-wrapper ${isSelected ? 'node-selected' : ''}">
            ${pulseRing}
            <div class="node-dot" style="background:${color}; box-shadow: 0 0 12px ${color}88, 0 0 4px ${color};">
                <span class="node-type-icon">${getTypeIcon(node.type)}</span>
            </div>
            ${label}
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
        transit: '🚂',
        epicenter: '⛩',
        holding: '🅿',
        chokepoint: '⚡',
    };
    return icons[type] || '📍';
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
    simulationActive,
    mitigationDiversion,
    mitigationBypass,
    simMetrics,
    selectedNode,
    onNodeSelect,
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapDivRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const routeLayersRef = useRef<L.Polyline[]>([]);
    const [mapReady, setMapReady] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapDivRef.current || mapRef.current) return;

        const map = L.map(mapDivRef.current, {
            center: [23.1765, 75.7780],
            zoom: 14,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer(DARK_TILE_URL, {
            maxZoom: 19,
            attribution: '© OpenStreetMap, © CARTO'
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map)
            .addAttribution('© CartoDB');

        mapRef.current = map;
        setMapReady(true);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update markers when simulation state changes
    useEffect(() => {
        if (!mapRef.current || !mapReady) return;
        const map = mapRef.current;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add markers for each location
        UJJAIN_LOCATIONS.forEach(node => {
            const isSelected = selectedNode?.id === node.id;
            const icon = getNodeIcon(node, simMetrics, isSelected);
            const marker = L.marker([node.lat, node.lng], { icon });

            marker.on('click', () => onNodeSelect(node));

            // Popup with node details
            const nodeStatus = simMetrics?.nodes[node.id];
            const popupContent = `
                <div class="map-popup">
                    <div class="popup-header">${node.name}</div>
                    <div class="popup-type">${node.type.toUpperCase()}</div>
                    ${nodeStatus ? `
                    <div class="popup-stats">
                        <span>Load: ${nodeStatus.currentLoad.toLocaleString()}</span>
                        <span>VFR: ${nodeStatus.vfr.toFixed(2)}</span>
                        <span class="popup-status-${nodeStatus.status}">${nodeStatus.status.toUpperCase()}</span>
                    </div>` : `
                    <div class="popup-stats">
                        <span>Capacity: ${node.maxCapacityPedestrians.toLocaleString()}</span>
                    </div>`}
                    <div class="popup-risk">${node.onGroundRiskFactor}</div>
                </div>
            `;
            marker.bindPopup(popupContent, { className: 'dark-popup', maxWidth: 280 });
            marker.addTo(map);
            markersRef.current.push(marker);
        });
    }, [mapReady, simMetrics, selectedNode, onNodeSelect]);

    // Update route overlays when mitigation toggles change
    useEffect(() => {
        if (!mapRef.current || !mapReady) return;
        const map = mapRef.current;

        // Remove old route layers
        routeLayersRef.current.forEach(l => l.remove());
        routeLayersRef.current = [];

        if (!simulationActive) return;

        const [b1Route, b2Route] = UJJAIN_BACKUP_ROUTES;

        // B1: Outer ring diversion — shown when mitigationDiversion active
        if (mitigationDiversion && b1Route) {
            const polyline = L.polyline(
                b1Route.pathCoordinates.map(c => [c.lat, c.lng]),
                {
                    color: '#f97316',
                    weight: 4,
                    opacity: 0.85,
                    dashArray: '10, 6',
                    className: 'route-animated',
                }
            );
            polyline.bindTooltip(
                `<b>${b1Route.name}</b><br>${b1Route.strategicAdvantage}`,
                { sticky: true, className: 'route-tooltip' }
            );
            polyline.addTo(map);
            routeLayersRef.current.push(polyline);
        }

        // B2: Dani Gate bypass — shown when mitigationBypass active
        if (mitigationBypass && b2Route) {
            const polyline = L.polyline(
                b2Route.pathCoordinates.map(c => [c.lat, c.lng]),
                {
                    color: '#a78bfa',
                    weight: 4,
                    opacity: 0.85,
                    dashArray: '8, 4',
                    className: 'route-animated',
                }
            );
            polyline.bindTooltip(
                `<b>${b2Route.name}</b><br>${b2Route.strategicAdvantage}`,
                { sticky: true, className: 'route-tooltip' }
            );
            polyline.addTo(map);
            routeLayersRef.current.push(polyline);
        }
    }, [mapReady, simulationActive, mitigationDiversion, mitigationBypass]);

    return (
        <div className="relative flex-1 h-screen overflow-hidden">
            <div ref={mapDivRef} className="w-full h-full" />

            {/* Map overlay: header badge */}
            <div className="map-overlay-header">
                <span className="map-badge">
                    <span className={`map-badge-dot ${simulationActive ? 'active' : ''}`} />
                    {simulationActive ? 'SIMULATION ACTIVE' : 'LIVE MONITOR'}
                </span>
                <span className="map-badge map-badge-coords">
                    UJJAIN · 23.18°N 75.78°E · Madhya Pradesh
                </span>
            </div>

            {/* VFR alert overlay when danger */}
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
                <div className="legend-item"><span className="legend-dot" style={{background:'#10b981'}}/>Nominal</div>
                <div className="legend-item"><span className="legend-dot" style={{background:'#f59e0b'}}/>Warning (VFR ≥ 0.85)</div>
                <div className="legend-item"><span className="legend-dot" style={{background:'#ef4444'}}/>CRUSH RISK (VFR ≥ 1.25)</div>
                {simulationActive && mitigationDiversion && (
                    <div className="legend-item"><span className="legend-line" style={{background:'#f97316'}}/>Outer Ring Diversion</div>
                )}
                {simulationActive && mitigationBypass && (
                    <div className="legend-item"><span className="legend-line" style={{background:'#a78bfa'}}/>Dani Gate Bypass</div>
                )}
            </div>
        </div>
    );
};
