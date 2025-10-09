package com.ujjain.crowdmanager.model;

/**
 * Represents a key geographic node in the Ujjain transit network.
 * Each node is a strategic location (temple, railway, holding zone, chokepoint)
 * with defined crowd capacities and risk characteristics.
 */
public class LocationNode {

    private String id;
    private String name;
    private double lat;
    private double lng;
    private String type; // transit | epicenter | holding | chokepoint
    private int maxCapacityPedestrians;
    private int maxCapacityVehicles;
    private String onGroundRiskFactor;

    public LocationNode() {}

    public LocationNode(String id, String name, double lat, double lng,
                        String type, int maxCapacityPedestrians,
                        int maxCapacityVehicles, String onGroundRiskFactor) {
        this.id = id;
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.type = type;
        this.maxCapacityPedestrians = maxCapacityPedestrians;
        this.maxCapacityVehicles = maxCapacityVehicles;
        this.onGroundRiskFactor = onGroundRiskFactor;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getMaxCapacityPedestrians() { return maxCapacityPedestrians; }
    public void setMaxCapacityPedestrians(int maxCapacityPedestrians) {
        this.maxCapacityPedestrians = maxCapacityPedestrians;
    }

    public int getMaxCapacityVehicles() { return maxCapacityVehicles; }
    public void setMaxCapacityVehicles(int maxCapacityVehicles) {
        this.maxCapacityVehicles = maxCapacityVehicles;
    }

    public String getOnGroundRiskFactor() { return onGroundRiskFactor; }
    public void setOnGroundRiskFactor(String onGroundRiskFactor) {
        this.onGroundRiskFactor = onGroundRiskFactor;
    }
}
