import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import { Terminal } from './components/Terminal';
import type { LocationNode } from './data/keyinfo';
import { fetchSimulationMetrics, computeSimulationMetrics } from './data/simulationEngine';
import type { SimMetrics } from './data/simulationEngine';
import './App.css';

function App() {
    const [simulationActive, setSimulationActive] = useState<boolean>(false);
    const [crowdLoad, setCrowdLoad] = useState<number>(40000);
    const [mitigationDiversion, setMitigationDiversion] = useState<boolean>(false);
    const [mitigationBypass, setMitigationBypass] = useState<boolean>(false);
    const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);
    const [simMetrics, setSimMetrics] = useState<SimMetrics | null>(null);

    // Re-compute metrics whenever inputs change
    const updateMetrics = useCallback(async () => {
        if (!simulationActive) {
            setSimMetrics(null);
            return;
        }
        try {
            const metrics = await fetchSimulationMetrics(crowdLoad, mitigationDiversion, mitigationBypass);
            setSimMetrics(metrics);
        } catch {
            // Use local fallback
            setSimMetrics(computeSimulationMetrics(crowdLoad, mitigationDiversion, mitigationBypass));
        }
    }, [simulationActive, crowdLoad, mitigationDiversion, mitigationBypass]);

    useEffect(() => {
        updateMetrics();
    }, [updateMetrics]);

    const handleToggleSimulation = () => {
        const next = !simulationActive;
        setSimulationActive(next);
        if (!next) {
            setMitigationDiversion(false);
            setMitigationBypass(false);
        }
    };

    return (
        <div className="app-root">
            <Sidebar
                simulationActive={simulationActive}
                onToggleSimulation={handleToggleSimulation}
                crowdLoad={crowdLoad}
                setCrowdLoad={setCrowdLoad}
                mitigationDiversion={mitigationDiversion}
                setMitigationDiversion={setMitigationDiversion}
                mitigationBypass={mitigationBypass}
                setMitigationBypass={setMitigationBypass}
                selectedNode={selectedNode}
                onClearSelectedNode={() => setSelectedNode(null)}
                simMetrics={simMetrics}
            >
                <Terminal
                    simulationActive={simulationActive}
                    crowdLoad={crowdLoad}
                    mitigationDiversion={mitigationDiversion}
                    mitigationBypass={mitigationBypass}
                    simMetrics={simMetrics}
                />
            </Sidebar>

            <MapCanvas
                simulationActive={simulationActive}
                mitigationDiversion={mitigationDiversion}
                mitigationBypass={mitigationBypass}
                simMetrics={simMetrics}
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
            />
        </div>
    );
}

export default App;
