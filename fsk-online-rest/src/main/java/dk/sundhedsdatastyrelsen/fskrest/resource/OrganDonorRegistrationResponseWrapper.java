package dk.sundhedsdatastyrelsen.fskrest.resource;

import org.hl7.odr.OrganDonorRegistration;
import org.springframework.stereotype.Component;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlType;

@Component
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "LivingWillResponseWrapper", propOrder = {
        "registrationType",
        "datetime"
})
public class OrganDonorRegistrationResponseWrapper {
    private OrganDonorRegistration registrationType;
    private String datetime;

    public OrganDonorRegistration getRegistrationType() {
        return registrationType;
    }

    public void setRegistrationType(OrganDonorRegistration registrationType) {
        this.registrationType = registrationType;
    }

    public String getDatetime() {
        return datetime;
    }

    public void setDatetime(String datetime) {
        this.datetime = datetime;
    }

}
