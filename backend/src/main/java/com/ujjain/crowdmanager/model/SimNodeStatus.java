package com.ujjain.crowdmanager.model;

/**
 * Per-node simulation status computed by the SimulationService.
 * Tracks real-time load vs capacity and triggers status flags.
 */
public class SimNodeStatus {

    private String id;
    private String name;
    private double currentLoad;
    private double maxCapacity;
    private double vfr; // Volume-to-Flow Ratio
    private String status; // nominal | warning | danger

    public SimNodeStatus() {}

    public SimNodeStatus(String id, String name, double currentLoad,
                         double maxCapacity, double vfr, String status) {
        this.id = id;
        this.name = name;
        this.currentLoad = currentLoad;
        this.maxCapacity = maxCapacity;
        this.vfr = vfr;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getCurrentLoad() { return currentLoad; }
    public void setCurrentLoad(double currentLoad) { this.currentLoad = currentLoad; }

    public double getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(double maxCapacity) { this.maxCapacity = maxCapacity; }

    public double getVfr() { return vfr; }
    public void setVfr(double vfr) { this.vfr = vfr; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
