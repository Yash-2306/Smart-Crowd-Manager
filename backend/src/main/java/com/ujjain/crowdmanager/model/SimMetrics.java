package com.ujjain.crowdmanager.model;

import java.util.Map;

/**
 * Aggregated simulation metrics returned by the /api/simulate endpoint.
 * Contains network-wide stats and per-node status map.
 */
public class SimMetrics {

    /** Peak Volume-to-Flow Ratio across the entire transit network */
    private double vfr;

    /** Composite safety index (0-100) derived from VFR and mitigation state */
    private int safetyIndex;

    /** Average pedestrian velocity in the network (e.g. "0.8 m/s") */
    private String avgVelocity;

    /** Estimated time until crowd conditions decline to critical state */
    private String timeToDecline;

    /** Per-node status map keyed by node ID */
    private Map<String, SimNodeStatus> nodes;

    public SimMetrics() {}

    public double getVfr() { return vfr; }
    public void setVfr(double vfr) { this.vfr = vfr; }

    public int getSafetyIndex() { return safetyIndex; }
    public void setSafetyIndex(int safetyIndex) { this.safetyIndex = safetyIndex; }

    public String getAvgVelocity() { return avgVelocity; }
    public void setAvgVelocity(String avgVelocity) { this.avgVelocity = avgVelocity; }

    public String getTimeToDecline() { return timeToDecline; }
    public void setTimeToDecline(String timeToDecline) { this.timeToDecline = timeToDecline; }

    public Map<String, SimNodeStatus> getNodes() { return nodes; }
    public void setNodes(Map<String, SimNodeStatus> nodes) { this.nodes = nodes; }
}
