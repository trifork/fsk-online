package dk.sundhedsdatastyrelsen.fskrest.resource;

import org.hl7.btrv2.TreatmentWillV2;
import org.springframework.stereotype.Component;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;

@Component
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "TreatmentWillResponseWrapper", propOrder = {
        "registrationType",
        "datetime"
})
public class TreatmentWillResponseWrapper {
    private TreatmentWillV2 registrationType;
    private String datetime;

    public TreatmentWillV2 getRegistrationType() {
        return registrationType;
    }

    public void setRegistrationType(TreatmentWillV2 registrationType) {
        this.registrationType = registrationType;
    }

    public String getDatetime() {
        return datetime;
    }

    public void setDatetime(String datetime) {
        this.datetime = datetime;
    }

}
