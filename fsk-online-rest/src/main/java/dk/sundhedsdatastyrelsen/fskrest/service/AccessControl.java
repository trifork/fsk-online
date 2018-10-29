package dk.sundhedsdatastyrelsen.fskrest.service;

public interface AccessControl {
    void checkOdrReadAccess();
    void checkLtrBtrReadAccess();
    void checkWriteAccess();
}
