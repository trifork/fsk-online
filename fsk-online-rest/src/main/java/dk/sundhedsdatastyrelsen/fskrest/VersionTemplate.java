package dk.sundhedsdatastyrelsen.fskrest;

/**
 * The Maven configuration will generate a "Version" class form this file
 * where the property values have been replaced by the real values.
 */
public class VersionTemplate {
    private static VersionTemplate instance = new VersionTemplate();

    private final String scmVersion = "@scmVersion@";
    private final String scmBranch = "@scmBranch@";
    private final String buildTime = "@buildtime@";
    private final String pomVersion = "@pomVersion@";

    public static VersionTemplate getInstance() {
        return instance;
    }

    public String getScmVersion() {
        return scmVersion;
    }

    public String getScmBranch() {
        return scmBranch;
    }

    public String getBuildTime() {
        return buildTime;
    }

    public String getPomVersion() {
        return pomVersion;
    }
}