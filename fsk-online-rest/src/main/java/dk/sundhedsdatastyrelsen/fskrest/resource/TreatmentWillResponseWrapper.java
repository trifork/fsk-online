package dk.sundhedsdatastyrelsen.fskrest.resource;

import org.hl7.btr.TreatmentWill;
import org.springframework.stereotype.Component;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;

@Component
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "LivingWillResponseWrapper", propOrder = {
        "registrationType",
        "datetime"
})
public class TreatmentWillResponseWrapper {
    private TreatmentWill registrationType;
    private String datetime;

    public TreatmentWill getRegistrationType() {
        return registrationType;
    }

    public void setRegistrationType(TreatmentWill registrationType) {
        this.registrationType = registrationType;
    }

    public String getDatetime() {
        return datetime;
    }

    public void setDatetime(String datetime) {
        this.datetime = datetime;
    }

}
