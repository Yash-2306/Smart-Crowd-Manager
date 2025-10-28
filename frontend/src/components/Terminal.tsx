import React, { useEffect, useState, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldCheck, AlertTriangle, ChevronDown } from 'lucide-react';
import type { SimMetrics } from '../data/simulationEngine';

interface TerminalProps {
    simulationActive: boolean;
    crowdLoad: number;
    mitigationDiversion: boolean;
    mitigationBypass: boolean;
    simMetrics: SimMetrics | null;
}

interface LogLine {
    text: string;
    type: 'info' | 'warn' | 'success' | 'danger';
    timestamp: string;
}

const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
};

export const Terminal: React.FC<TerminalProps> = ({
    simulationActive,
    crowdLoad,
    mitigationDiversion,
    mitigationBypass,
    simMetrics,
}) => {
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const prevProps = useRef({ crowdLoad, mitigationDiversion, mitigationBypass, simulationActive });

    const dormantLogs = (): LogLine[] => [
        { text: 'SYSTEM INIT: Simhastha Transit Command Center Node UJN-2028-01', type: 'success', timestamp: getTimestamp() },
        { text: 'SLM ENGINE: Cognitive Small Language Model v4.11 loaded', type: 'info', timestamp: getTimestamp() },
        { text: 'BACKEND: Spring Boot API at localhost:8080 — CONNECTED', type: 'success', timestamp: getTimestamp() },
        { text: 'INGESTION: Realtime crowd feeds reading @ 124.8 Hz', type: 'info', timestamp: getTimestamp() },
        { text: 'VFR CHECK: Nominals detected (VFR: 0.33). Transit channels open', type: 'success', timestamp: getTimestamp() },
        { text: 'HEARTBEAT: System status green. No congestion warnings', type: 'info', timestamp: getTimestamp() },
    ];

    const getSimulationSequence = (load: number, div: boolean, bypass: boolean, metrics: SimMetrics | null): Omit<LogLine, 'timestamp'>[] => {
        const seq: Omit<LogLine, 'timestamp'>[] = [
            { text: `CRITICAL ALERT: Shahi Snan Influx Trigger received (${load.toLocaleString()} pilgrims/hr)`, type: 'danger' },
            { text: 'BACKEND → POST /api/simulate: Dispatching to Spring Boot computation engine...', type: 'info' },
            { text: 'SLM ENGINE: Initializing Cognitive Transit Routing Evaluation...', type: 'info' },
            { text: 'GEOSPATIAL DIAGNOSTIC: Reading all 6 geofenced location nodes...', type: 'info' },
        ];

        if (!div) {
            seq.push({ text: 'SLM EVALUATION: Direct trunk corridor highly loaded. VFR exceeds nominal limits.', type: 'warn' });
        } else {
            seq.push({ text: 'SLM EVALUATION: Harifatak outer ring bypass ACTIVE. Direct route traffic balanced.', type: 'success' });
        }

        if (!bypass) {
            seq.push({ text: 'SLM EVALUATION: Harsiddhi Mata Temple Square has critical geometric constrictions. Crush risk is HIGH.', type: 'warn' });
        } else {
            seq.push({ text: 'SLM EVALUATION: Dani Gate elevated catwalk ACTIVE. Outflowing crowd diverted around Harsiddhi.', type: 'success' });
        }

        if (metrics) {
            seq.push({
                text: `SYSTEM ANALYSIS: Safety Index: ${metrics.safetyIndex}% | Max VFR: ${metrics.vfr} | Flow: ${metrics.avgVelocity}`,
                type: metrics.safetyIndex < 50 ? 'danger' : metrics.safetyIndex < 75 ? 'warn' : 'success',
            });
            seq.push({
                text: `PREDICTIVE ENGINE: Time-To-Decline estimate: ${metrics.timeToDecline}`,
                type: metrics.vfr >= 1.25 ? 'danger' : 'info',
            });

            const dangerNodes = Object.values(metrics.nodes).filter(n => n.status === 'danger');
            if (dangerNodes.length > 0) {
                dangerNodes.forEach(n => {
                    seq.push({ text: `⚠ CRUSH ALERT: ${n.name} — VFR ${n.vfr.toFixed(2)} EXCEEDS THRESHOLD`, type: 'danger' });
                });
                seq.push({ text: 'RECOMMENDATION: Engage all available mitigation protocols immediately.', type: 'danger' });
            } else {
                seq.push({ text: 'STATUS: All node VFRs within manageable bounds. Continue monitoring.', type: 'success' });
            }
        }

        return seq;
    };

    useEffect(() => {
        setLogs(dormantLogs());
    }, []);

    useEffect(() => {
        const prev = prevProps.current;
        const changed = prev.simulationActive !== simulationActive ||
            prev.crowdLoad !== crowdLoad ||
            prev.mitigationDiversion !== mitigationDiversion ||
            prev.mitigationBypass !== mitigationBypass;

        prevProps.current = { crowdLoad, mitigationDiversion, mitigationBypass, simulationActive };

        if (!changed) return;

        if (!simulationActive) {
            setLogs([
                { text: 'SYSTEM: Command center reset. Returning to standby mode.', type: 'info', timestamp: getTimestamp() },
                { text: 'HEARTBEAT: All systems nominal. Crowd feeds live.', type: 'success', timestamp: getTimestamp() },
            ]);
            return;
        }

        const sequence = getSimulationSequence(crowdLoad, mitigationDiversion, mitigationBypass, simMetrics);
        setLogs([]);

        sequence.forEach((line, i) => {
            setTimeout(() => {
                setLogs(prev => [...prev, { ...line, timestamp: getTimestamp() }]);
            }, i * 280);
        });
    }, [simulationActive, crowdLoad, mitigationDiversion, mitigationBypass]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    const typeColors: Record<string, string> = {
        info: '#38bdf8',
        warn: '#fbbf24',
        success: '#4ade80',
        danger: '#f87171',
    };

    return (
        <div className="terminal">
            <div className="terminal-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="terminal-title">
                    <TerminalIcon className="term-icon" />
                    SLM EVALUATION FEED
                </div>
                <div className="terminal-controls">
                    {simulationActive ? (
                        <AlertTriangle className="term-status-icon warn-icon" />
                    ) : (
                        <ShieldCheck className="term-status-icon ok-icon" />
                    )}
                    <ChevronDown className={`term-chevron ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isExpanded && (
                <div ref={containerRef} className="terminal-body">
                    {logs.map((log, i) => (
                        <div key={i} className="log-line">
                            <span className="log-timestamp">[{log.timestamp}]</span>
                            <span className="log-text" style={{ color: typeColors[log.type] }}>
                                {log.text}
                            </span>
                        </div>
                    ))}
                    <div className="terminal-cursor">_</div>
                </div>
            )}
        </div>
    );
};
