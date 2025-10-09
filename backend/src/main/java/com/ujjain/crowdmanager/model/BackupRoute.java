package com.ujjain.crowdmanager.model;

import java.util.List;

/**
 * Represents a backup/diversion route on the Ujjain transit network.
 * These routes are activated when Volume-to-Flow Ratio exceeds safe thresholds.
 */
public class BackupRoute {

    private String id;
    private String name;
    private List<Coordinate> pathCoordinates;
    private String strategicAdvantage;

    public BackupRoute() {}

    public BackupRoute(String id, String name, List<Coordinate> pathCoordinates,
                       String strategicAdvantage) {
        this.id = id;
        this.name = name;
        this.pathCoordinates = pathCoordinates;
        this.strategicAdvantage = strategicAdvantage;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Coordinate> getPathCoordinates() { return pathCoordinates; }
    public void setPathCoordinates(List<Coordinate> pathCoordinates) {
        this.pathCoordinates = pathCoordinates;
    }

    public String getStrategicAdvantage() { return strategicAdvantage; }
    public void setStrategicAdvantage(String strategicAdvantage) {
        this.strategicAdvantage = strategicAdvantage;
    }

    public static class Coordinate {
        private double lat;
        private double lng;

        public Coordinate() {}
        public Coordinate(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public double getLat() { return lat; }
        public void setLat(double lat) { this.lat = lat; }

        public double getLng() { return lng; }
        public void setLng(double lng) { this.lng = lng; }
    }
}
