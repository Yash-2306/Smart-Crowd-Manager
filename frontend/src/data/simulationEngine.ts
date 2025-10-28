import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface SimNodeStatus {
    id: string;
    name: string;
    currentLoad: number;
    maxCapacity: number;
    vfr: number;
    status: 'nominal' | 'warning' | 'danger';
}

export interface SimMetrics {
    vfr: number;
    safetyIndex: number;
    avgVelocity: string;
    timeToDecline: string;
    nodes: Record<string, SimNodeStatus>;
}

/**
 * Calls the Spring Boot backend to compute simulation metrics.
 * Falls back to local computation if the API is unreachable.
 */
export async function fetchSimulationMetrics(
    crowdLoad: number,
    mitigationDiversion: boolean,
    mitigationBypass: boolean
): Promise<SimMetrics> {
    try {
        const response = await axios.post<SimMetrics>(`${API_BASE}/simulate`, {
            crowdLoad,
            mitigationDiversion,
            mitigationBypass
        }, { timeout: 3000 });
        return response.data;
    } catch {
        // Fallback: compute locally if backend is offline
        return computeSimulationMetrics(crowdLoad, mitigationDiversion, mitigationBypass);
    }
}

/**
 * Local fallback simulation engine — mirrors SimulationService.java
 */
export function computeSimulationMetrics(
    crowdLoad: number,
    mitigationDiversion: boolean,
    mitigationBypass: boolean
): SimMetrics {
    const nodeCapacities: Record<string, number> = {
        ujjain_jnc: 120000,
        mahakal_corridor: 250000,
        harsiddhi_mandir: 30000,
        ram_ghat: 350000,
        nanakheda_holding: 80000,
        mangalnath_mandir: 60000,
    };

    const nodeNames: Record<string, string> = {
        ujjain_jnc: "Ujjain Junction Railway Station",
        mahakal_corridor: "Mahakaleshwar Temple Corridor Complex",
        harsiddhi_mandir: "Harsiddhi Mata Temple Square",
        ram_ghat: "Ram Ghat Riverfront Bathing Zone",
        nanakheda_holding: "Nanakheda Bus Terminal Holding Zone",
        mangalnath_mandir: "Mangalnath Mandir Transit Node",
    };

    const rawLoads: Record<string, number> = {
        ujjain_jnc: crowdLoad * 0.9,
        nanakheda_holding: crowdLoad * 0.6,
        mahakal_corridor: mitigationDiversion ? crowdLoad * 0.95 : crowdLoad * 1.6,
        harsiddhi_mandir: mitigationBypass ? crowdLoad * 0.35 * 0.25 : crowdLoad * 0.35,
        ram_ghat: mitigationBypass ? crowdLoad * 1.1 : crowdLoad * 1.4,
        mangalnath_mandir: crowdLoad * 0.45,
    };

    const nodes: Record<string, SimNodeStatus> = {};
    for (const [id, load] of Object.entries(rawLoads)) {
        const capacity = nodeCapacities[id];
        const vfr = Math.round((load / capacity) * 100) / 100;
        const status: 'nominal' | 'warning' | 'danger' =
            vfr >= 1.25 ? 'danger' : vfr >= 0.85 ? 'warning' : 'nominal';
        nodes[id] = {
            id,
            name: nodeNames[id],
            currentLoad: Math.round(load),
            maxCapacity: capacity,
            vfr,
            status,
        };
    }

    const peakVfr = Math.max(...Object.values(nodes).map(n => n.vfr));

    let base = Math.max(0, 100 - peakVfr * 55);
    const safetyIndex = Math.min(100, Math.round(base + (mitigationDiversion ? 12 : 0) + (mitigationBypass ? 10 : 0)));

    const getVelocity = (vfr: number) => {
        if (vfr < 0.5) return "1.4 m/s (LOS-A, Free Flow)";
        if (vfr < 0.75) return "1.2 m/s (LOS-B, Stable)";
        if (vfr < 1.0) return "0.9 m/s (LOS-C, Constrained)";
        if (vfr < 1.25) return "0.6 m/s (LOS-D, Unstable)";
        if (vfr < 1.5) return "0.4 m/s (LOS-E, Forced Flow)";
        return "0.1 m/s (LOS-F, CRUSH RISK)";
    };

    const getTTD = () => {
        if (peakVfr < 0.85) return "N/A — Nominal Conditions";
        let mins = Math.round(120 / ((peakVfr - 0.85) * crowdLoad / 50000));
        if (mitigationDiversion) mins = Math.round(mins * 1.4);
        if (mitigationBypass) mins = Math.round(mins * 1.3);
        mins = Math.min(480, Math.max(5, mins));
        return mins >= 60
            ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`
            : `${mins} min`;
    };

    return {
        vfr: Math.round(peakVfr * 100) / 100,
        safetyIndex,
        avgVelocity: getVelocity(peakVfr),
        timeToDecline: getTTD(),
        nodes,
    };
}
