package com.ujjain.crowdmanager.controller;

import com.ujjain.crowdmanager.model.*;
import com.ujjain.crowdmanager.service.LocationDataService;
import com.ujjain.crowdmanager.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Primary REST controller for the Ujjain Smart Crowd Manager API.
 *
 * Exposes endpoints for:
 *  - Fetching geographic location nodes
 *  - Fetching backup/diversion routes
 *  - Running crowd simulation (POST with crowd parameters)
 *  - Health check
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CrowdController {

    private final SimulationService simulationService;
    private final LocationDataService locationDataService;

    public CrowdController(SimulationService simulationService,
                           LocationDataService locationDataService) {
        this.simulationService = simulationService;
        this.locationDataService = locationDataService;
    }

    /**
     * GET /api/locations
     * Returns all strategic transit nodes in the Ujjain network.
     */
    @GetMapping("/locations")
    public ResponseEntity<List<LocationNode>> getLocations() {
        return ResponseEntity.ok(locationDataService.getAllLocations());
    }

    /**
     * GET /api/routes
     * Returns all pre-configured backup diversion routes.
     */
    @GetMapping("/routes")
    public ResponseEntity<List<BackupRoute>> getRoutes() {
        return ResponseEntity.ok(locationDataService.getAllRoutes());
    }

    /**
     * POST /api/simulate
     * Computes real-time crowd simulation metrics based on input parameters.
     *
     * Request body:
     * {
     *   "crowdLoad": 120000,
     *   "mitigationDiversion": false,
     *   "mitigationBypass": false
     * }
     *
     * Returns SimMetrics with per-node VFR, safety index, velocity, and TTD.
     */
    @PostMapping("/simulate")
    public ResponseEntity<SimMetrics> runSimulation(@RequestBody SimRequest request) {
        SimMetrics metrics = simulationService.computeMetrics(
                request.getCrowdLoad(),
                request.isMitigationDiversion(),
                request.isMitigationBypass()
        );
        return ResponseEntity.ok(metrics);
    }

    /**
     * GET /api/health
     * Health check endpoint for load balancers and monitoring.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Ujjain Smart Crowd Manager",
                "version", "1.0.0",
                "node", "UJN-2028-CMD-01"
        ));
    }
}
