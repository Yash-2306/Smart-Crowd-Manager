import React, { useState } from 'react';
import type { LocationNode } from '../data/keyinfo';
import type { SimMetrics } from '../data/simulationEngine';
import {
    Activity, ShieldAlert, Award, TrendingUp,
    Zap, RefreshCw, Info, BarChart2, Clock
} from 'lucide-react';

const HISTORICAL_DATA: Record<number, {
    domestic: number; intl: number; revenue: number; donations: number;
    wqi: number; waste: number; air: number; media: number; celebrities: number;
    crimes: number; sentimentPos: number;
}> = {
    1982: { domestic: 3200000, intl: 45000, revenue: 8200000, donations: 3100000, wqi: 72, waste: 4200, air: 58, media: 12, celebrities: 8, crimes: 142, sentimentPos: 76 },
    1994: { domestic: 5800000, intl: 78000, revenue: 22000000, donations: 8900000, wqi: 64, waste: 9100, air: 71, media: 28, celebrities: 22, crimes: 218, sentimentPos: 71 },
    2004: { domestic: 9100000, intl: 120000, revenue: 58000000, donations: 21000000, wqi: 55, waste: 18400, air: 84, media: 65, celebrities: 41, crimes: 309, sentimentPos: 68 },
    2016: { domestic: 14200000, intl: 185000, revenue: 165000000, donations: 62000000, wqi: 48, waste: 31200, air: 92, media: 142, celebrities: 78, crimes: 441, sentimentPos: 74 },
};

interface SidebarProps {
    simulationActive: boolean;
    onToggleSimulation: () => void;
    crowdLoad: number;
    setCrowdLoad: (val: number) => void;
    mitigationDiversion: boolean;
    setMitigationDiversion: (val: boolean) => void;
    mitigationBypass: boolean;
    setMitigationBypass: (val: boolean) => void;
    selectedNode: LocationNode | null;
    onClearSelectedNode: () => void;
    simMetrics: SimMetrics | null;
    children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
    simulationActive,
    onToggleSimulation,
    crowdLoad,
    setCrowdLoad,
    mitigationDiversion,
    setMitigationDiversion,
    mitigationBypass,
    setMitigationBypass,
    selectedNode,
    onClearSelectedNode,
    simMetrics,
    children,
}) => {
    const [activeTab, setActiveTab] = useState<'realtime' | 'history'>('realtime');
    const [historyYear, setHistoryYear] = useState<number>(2016);

    const vfr = simMetrics?.vfr ?? 0.33;
    const safetyIndex = simMetrics?.safetyIndex ?? 97;
    const avgVelocity = simMetrics?.avgVelocity ?? '1.4 m/s (LOS-A, Free Flow)';
    const timeToDecline = simMetrics?.timeToDecline ?? 'N/A — Nominal Conditions';

    const safetyColor = safetyIndex >= 70 ? '#10b981' : safetyIndex >= 40 ? '#f59e0b' : '#ef4444';
    const vfrColor = vfr >= 1.25 ? '#ef4444' : vfr >= 0.85 ? '#f59e0b' : '#10b981';

    const histData = HISTORICAL_DATA[historyYear];
    const years = [1982, 1994, 2004, 2016];

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div>
                    <h1 className="sidebar-title">SIMHASTHA UJJAIN</h1>
                    <p className="sidebar-subtitle">
                        <span className="status-dot" />
                        Predictive Transit Command
                    </p>
                </div>
                <div className="sidebar-badge">UJN-2028</div>
            </div>

            {/* Simulation Toggle */}
            <div className="sidebar-action-bar">
                <button
                    onClick={onToggleSimulation}
                    className={`sim-button ${simulationActive ? 'sim-button-active' : 'sim-button-idle'}`}
                >
                    {simulationActive ? (
                        <><RefreshCw className="btn-icon spin" /> Reset Command Center</>
                    ) : (
                        <><Zap className="btn-icon pulse" /> Simulate Peak Shahi Snan Influx</>
                    )}
                </button>
            </div>

            {/* Simulation Controls */}
            {simulationActive && (
                <div className="sim-controls">
                    <div className="control-group">
                        <div className="control-label-row">
                            <span className="control-label">Influx Rate Limit</span>
                            <span className="control-value">{crowdLoad.toLocaleString()} / hr</span>
                        </div>
                        <input
                            type="range" min="20000" max="200000" step="5000"
                            value={crowdLoad}
                            onChange={e => setCrowdLoad(Number(e.target.value))}
                            className="crowd-slider"
                        />
                        <div className="slider-labels">
                            <span>20K</span><span>200K</span>
                        </div>
                    </div>

                    <div className="mitigation-group">
                        <div className="mitigation-label">Active Mitigations</div>
                        <label className="toggle-row">
                            <div className="toggle-info">
                                <span className="toggle-name">Harifatak Outer Ring Diversion</span>
                                <span className="toggle-desc">Bypasses inner-city via B1 route</span>
                            </div>
                            <button
                                onClick={() => setMitigationDiversion(!mitigationDiversion)}
                                className={`toggle-btn ${mitigationDiversion ? 'toggle-on' : 'toggle-off'}`}
                            >
                                {mitigationDiversion ? 'ON' : 'OFF'}
                            </button>
                        </label>
                        <label className="toggle-row">
                            <div className="toggle-info">
                                <span className="toggle-name">Dani Gate Elevated Bypass</span>
                                <span className="toggle-desc">Diverts 75% flow above Harsiddhi</span>
                            </div>
                            <button
                                onClick={() => setMitigationBypass(!mitigationBypass)}
                                className={`toggle-btn ${mitigationBypass ? 'toggle-on' : 'toggle-off'}`}
                            >
                                {mitigationBypass ? 'ON' : 'OFF'}
                            </button>
                        </label>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tab-bar">
                <button
                    className={`tab-btn ${activeTab === 'realtime' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('realtime')}
                >
                    <Activity className="tab-icon" /> Real-Time
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <TrendingUp className="tab-icon" /> History
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'realtime' && (
                    <div className="realtime-panel">
                        {/* Key Metrics */}
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-header">
                                    <ShieldAlert className="metric-icon" style={{ color: vfrColor }} />
                                    <span className="metric-title">Peak VFR</span>
                                </div>
                                <div className="metric-value" style={{ color: vfrColor }}>
                                    {vfr.toFixed(2)}
                                </div>
                                <div className="metric-sub">Vol / Capacity Ratio</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-header">
                                    <Award className="metric-icon" style={{ color: safetyColor }} />
                                    <span className="metric-title">Safety Index</span>
                                </div>
                                <div className="metric-value" style={{ color: safetyColor }}>
                                    {safetyIndex}<span className="metric-unit">%</span>
                                </div>
                                <div className="safety-bar">
                                    <div className="safety-fill" style={{ width: `${safetyIndex}%`, background: safetyColor }} />
                                </div>
                            </div>
                        </div>

                        <div className="info-cards">
                            <div className="info-card">
                                <Activity className="info-icon" />
                                <div>
                                    <div className="info-label">Avg. Flow Velocity</div>
                                    <div className="info-value">{avgVelocity}</div>
                                </div>
                            </div>
                            <div className="info-card">
                                <Clock className="info-icon" />
                                <div>
                                    <div className="info-label">Time To Decline</div>
                                    <div className="info-value">{timeToDecline}</div>
                                </div>
                            </div>
                        </div>

                        {/* Node Status Table */}
                        {simMetrics && (
                            <div className="node-table">
                                <div className="node-table-title">NODE STATUS MATRIX</div>
                                {Object.values(simMetrics.nodes).map(node => (
                                    <div key={node.id} className={`node-row node-row-${node.status}`}>
                                        <div className="node-row-name">{node.name.split(' ').slice(0, 2).join(' ')}</div>
                                        <div className="node-row-stats">
                                            <span className="node-vfr">{node.vfr.toFixed(2)}</span>
                                            <span className={`node-status-badge badge-${node.status}`}>
                                                {node.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selected Node Panel */}
                        {selectedNode && (
                            <div className="selected-node-panel">
                                <div className="selected-node-header">
                                    <Info className="selected-icon" />
                                    <span>{selectedNode.name}</span>
                                    <button onClick={onClearSelectedNode} className="clear-btn">✕</button>
                                </div>
                                <div className="selected-node-body">
                                    <div className="selected-row">
                                        <span>Type</span>
                                        <span className="selected-val">{selectedNode.type.toUpperCase()}</span>
                                    </div>
                                    <div className="selected-row">
                                        <span>Max Capacity</span>
                                        <span className="selected-val">{selectedNode.maxCapacityPedestrians.toLocaleString()}</span>
                                    </div>
                                    <div className="selected-risk">{selectedNode.onGroundRiskFactor}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-panel">
                        <div className="history-title">
                            <BarChart2 className="history-icon" />
                            Mahakumbh Historical Data Matrix
                        </div>
                        <div className="year-selector">
                            {years.map(yr => (
                                <button
                                    key={yr}
                                    onClick={() => setHistoryYear(yr)}
                                    className={`year-btn ${historyYear === yr ? 'year-active' : ''}`}
                                >
                                    {yr}
                                </button>
                            ))}
                        </div>
                        {histData && (
                            <div className="history-data">
                                <div className="hist-section-title">Visitor Metrics</div>
                                <div className="hist-row">
                                    <span>Domestic Visitors</span>
                                    <span className="hist-val">{(histData.domestic / 1000000).toFixed(1)}M</span>
                                </div>
                                <div className="hist-row">
                                    <span>International Visitors</span>
                                    <span className="hist-val">{histData.intl.toLocaleString()}</span>
                                </div>
                                <div className="hist-row">
                                    <span>Total Revenue</span>
                                    <span className="hist-val">₹{(histData.revenue / 10000000).toFixed(1)}Cr</span>
                                </div>
                                <div className="hist-row">
                                    <span>Donations Received</span>
                                    <span className="hist-val">₹{(histData.donations / 10000000).toFixed(1)}Cr</span>
                                </div>
                                <div className="hist-section-title">Safety & Environment</div>
                                <div className="hist-row">
                                    <span>Water Quality Index</span>
                                    <span className="hist-val" style={{ color: histData.wqi > 60 ? '#10b981' : '#f59e0b' }}>
                                        {histData.wqi}/100
                                    </span>
                                </div>
                                <div className="hist-row">
                                    <span>Waste Generated</span>
                                    <span className="hist-val">{histData.waste.toLocaleString()} T</span>
                                </div>
                                <div className="hist-row">
                                    <span>Air Pollution Level</span>
                                    <span className="hist-val" style={{ color: histData.air > 80 ? '#ef4444' : '#f59e0b' }}>
                                        {histData.air} AQI
                                    </span>
                                </div>
                                <div className="hist-row">
                                    <span>Crime Incidents</span>
                                    <span className="hist-val">{histData.crimes}</span>
                                </div>
                                <div className="hist-section-title">Media & Sentiment</div>
                                <div className="hist-row">
                                    <span>Intl Media Coverage</span>
                                    <span className="hist-val">{histData.media} outlets</span>
                                </div>
                                <div className="hist-row">
                                    <span>Celebrity Visits</span>
                                    <span className="hist-val">{histData.celebrities}</span>
                                </div>
                                <div className="hist-row">
                                    <span>Positive Sentiment</span>
                                    <span className="hist-val" style={{ color: '#10b981' }}>
                                        {histData.sentimentPos}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Terminal slot */}
            {children}
        </div>
    );
};
