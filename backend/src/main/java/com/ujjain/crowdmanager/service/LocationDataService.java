package com.ujjain.crowdmanager.service;

import com.ujjain.crowdmanager.model.LocationNode;
import com.ujjain.crowdmanager.model.BackupRoute;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.ujjain.crowdmanager.model.BackupRoute.Coordinate;

/**
 * Provides static geographic data for the Ujjain transit network.
 * Contains all key LocationNodes and BackupRoutes used by the command center.
 *
 * Data sourced from:
 *  - Ujjain Municipal Corporation transit maps
 *  - Simhastha 2016 crowd management reports
 *  - Historical incident analysis (Harsiddhi bottleneck, Ram Ghat surge records)
 */
@Service
public class LocationDataService {

    /**
     * Returns all strategic transit nodes in the Ujjain network.
     */
    public List<LocationNode> getAllLocations() {
        List<LocationNode> locations = new ArrayList<>();

        locations.add(new LocationNode(
                "ujjain_jnc",
                "Ujjain Junction Railway Station",
                23.1786, 75.7807,
                "transit",
                120000, 5000,
                "Primary entry point. Unloads multi-thousand passenger waves simultaneously causing immediate street congestion."
        ));

        locations.add(new LocationNode(
                "mahakal_corridor",
                "Mahakaleshwar Temple Corridor Complex",
                23.1829, 75.7682,
                "epicenter",
                250000, 0,
                "Massive terminal destination. Geographically disconnected from the riverfront, causing dead-end crowd packing."
        ));

        locations.add(new LocationNode(
                "harsiddhi_mandir",
                "Harsiddhi Mata Temple Square",
                23.1802, 75.7644,
                "chokepoint",
                30000, 200,
                "Critical 37m-wide bottleneck between the Mahakal Corridor and Ram Ghat. Historical crush risk point (2016 incident data)."
        ));

        locations.add(new LocationNode(
                "ram_ghat",
                "Ram Ghat Riverfront Bathing Zone",
                23.1855, 75.7648,
                "epicenter",
                350000, 0,
                "Primary Shahi Snan bathing zone on the Kshipra. Attracts maximum pilgrim density during auspicious bath timings."
        ));

        locations.add(new LocationNode(
                "nanakheda_holding",
                "Nanakheda Bus Terminal Holding Zone",
                23.1720, 75.7941,
                "holding",
                80000, 12000,
                "Eastern corridor interceptor. Controls inbound vehicle flow before it enters the narrow inner-city grid."
        ));

        locations.add(new LocationNode(
                "mangalnath_mandir",
                "Mangalnath Mandir Transit Node",
                23.1554, 75.7769,
                "transit",
                60000, 3000,
                "Southern approach node. Feeds into the Ram Ghat riverfront via narrow heritage lanes."
        ));

        return locations;
    }

    /**
     * Returns all pre-configured backup/diversion routes.
     * These are activated when VFR exceeds 1.25 at key nodes.
     */
    public List<BackupRoute> getAllRoutes() {
        List<BackupRoute> routes = new ArrayList<>();

        // B1: Outer Ring Diversion — Harifatak road bypass of inner city
        List<Coordinate> b1Path = new ArrayList<>();
        b1Path.add(new Coordinate(23.1786, 75.7807)); // Ujjain Junction
        b1Path.add(new Coordinate(23.1760, 75.7780));
        b1Path.add(new Coordinate(23.1745, 75.7720));
        b1Path.add(new Coordinate(23.1760, 75.7660));
        b1Path.add(new Coordinate(23.1829, 75.7682)); // Mahakal Corridor
        routes.add(new BackupRoute(
                "b1_outer_ring_diversion",
                "Harifatak Outer Ring Diversion",
                b1Path,
                "Bypasses the congested inner-city grid via the Harifatak road, reducing travel time by 38% during peak VFR conditions."
        ));

        // B2: Dani Gate Elevated Bypass — Pedestrian catwalk above Harsiddhi Square
        List<Coordinate> b2Path = new ArrayList<>();
        b2Path.add(new Coordinate(23.1829, 75.7682)); // Mahakal
        b2Path.add(new Coordinate(23.1815, 75.7665));
        b2Path.add(new Coordinate(23.1802, 75.7644)); // Harsiddhi (pass-through)
        b2Path.add(new Coordinate(23.1830, 75.7646));
        b2Path.add(new Coordinate(23.1855, 75.7648)); // Ram Ghat
        routes.add(new BackupRoute(
                "b2_dani_gate_bypass",
                "Dani Gate Elevated Catwalk Bypass",
                b2Path,
                "Diverts 75% of Mahakal→Ram Ghat pedestrian flow above the Harsiddhi Square bottleneck, eliminating crush risk."
        ));

        return routes;
    }
}
