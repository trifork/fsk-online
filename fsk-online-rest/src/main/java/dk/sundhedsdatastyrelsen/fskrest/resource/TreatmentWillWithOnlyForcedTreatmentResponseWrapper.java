package dk.sundhedsdatastyrelsen.fskrest.resource;

import org.hl7.btrv2.TreatmentWillWithOnlyForcedTreatment;
import org.springframework.stereotype.Component;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlType;

@Component
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "TreatmentWillWithOnlyForcedTreatmentResponseWrapper", propOrder = {
        "registrationType",
        "datetime"
})
public class TreatmentWillWithOnlyForcedTreatmentResponseWrapper {
    private TreatmentWillWithOnlyForcedTreatment registrationType;
    private String datetime;

    public TreatmentWillWithOnlyForcedTreatment getRegistrationType() {
        return registrationType;
    }

    public void setRegistrationType(TreatmentWillWithOnlyForcedTreatment registrationType) {
        this.registrationType = registrationType;
    }

    public String getDatetime() {
        return datetime;
    }

    public void setDatetime(String datetime) {
        this.datetime = datetime;
    }

}
