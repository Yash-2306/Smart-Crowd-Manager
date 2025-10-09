package com.ujjain.crowdmanager.model;

/**
 * Request payload for the /api/simulate endpoint.
 * Encapsulates the crowd load and active mitigation strategies.
 */
public class SimRequest {

    /** Number of pilgrims entering the transit network per hour */
    private int crowdLoad;

    /** Whether the Harifatak outer ring diversion route is active */
    private boolean mitigationDiversion;

    /** Whether the Dani Gate elevated bypass is active */
    private boolean mitigationBypass;

    public SimRequest() {}

    public int getCrowdLoad() { return crowdLoad; }
    public void setCrowdLoad(int crowdLoad) { this.crowdLoad = crowdLoad; }

    public boolean isMitigationDiversion() { return mitigationDiversion; }
    public void setMitigationDiversion(boolean mitigationDiversion) {
        this.mitigationDiversion = mitigationDiversion;
    }

    public boolean isMitigationBypass() { return mitigationBypass; }
    public void setMitigationBypass(boolean mitigationBypass) {
        this.mitigationBypass = mitigationBypass;
    }
}
