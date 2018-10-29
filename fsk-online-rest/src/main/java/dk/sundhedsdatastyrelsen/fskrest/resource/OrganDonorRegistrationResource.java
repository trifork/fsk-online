package dk.sundhedsdatastyrelsen.fskrest.resource;

import dk.sundhedsdatastyrelsen.organdonor._2018._05._01.*;
import org.apache.log4j.Logger;
import org.hl7.odr.OrganDonorRegistration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/odr")
@Component
public class OrganDonorRegistrationResource extends AbstractResource {
    Logger logger = Logger.getLogger(OrganDonorRegistrationResource.class);

    @Autowired
    OrganDonorRegistrationPortType organDonorRegistrationPortType;

    @GET
    @Path("/getOrganDonorRegistration")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getOrganDonorRegistration(@QueryParam("cpr") String cpr) {
        accessControl.checkOdrReadAccess();
        GetOrganDonorRegistrationRequest request = new GetOrganDonorRegistrationRequest();
        request.setId(getId(cpr));
        GetOrganDonorRegistrationResponse response = organDonorRegistrationPortType.getOrganDonorRegistration20180501(request);
        try {
            OrganDonorRegistration organDonorRegistration = (OrganDonorRegistration) response.getClinicalDocument().getComponent().getStructuredBody().
                    getComponents().get(0).getSection().getEntries().get(0).getObservation().getValues().get(0);
            return buildNonCacheableResponse(organDonorRegistration);
        } catch (Exception e) {
            logger.error("Error extracting organdonor from response: " +  e.getMessage());
            return Response.status(Response.Status.NO_CONTENT).build();
        }
    }

    @GET
    @Path("/hasOrganDonorRegistration")
    @Produces(MediaType.APPLICATION_JSON)
    public Response hasOrganDonorRegistration(@QueryParam("cpr") String cpr) {
        accessControl.checkOdrReadAccess();
        HasOrganDonorRegistrationRequest request = new HasOrganDonorRegistrationRequest();
        request.setId(getId(cpr));
        HasOrganDonorRegistrationResponse response = organDonorRegistrationPortType.hasOrganDonorRegistration20180501(request);
        return buildNonCacheableResponse(response);
    }

    @POST
    @Path("/createOrganDonorRegistration")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createOrganDonorRegistration(@QueryParam("cpr") String cpr, OrganDonorRegistration organDonorRegistration) {
        accessControl.checkWriteAccess();
        CreateOrganDonorRegistrationRequest request = new CreateOrganDonorRegistrationRequest();
        request.setId(getId(cpr));
        request.setOrganDonorRegistration(organDonorRegistration);
        CreateOrganDonorRegistrationResponse response = organDonorRegistrationPortType.createOrganDonorRegistration20180501(request);
        return buildNonCacheableResponse(response);
    }

    @PUT
    @Path("/updateOrganDonorRegistration")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateOrganDonorRegistration(@QueryParam("cpr") String cpr, OrganDonorRegistration organDonorRegistration) {
        accessControl.checkWriteAccess();
        UpdateOrganDonorRegistrationRequest request = new UpdateOrganDonorRegistrationRequest();
        request.setId(getId(cpr));
        request.setOrganDonorRegistration(organDonorRegistration);
        UpdateOrganDonorRegistrationResponse response = organDonorRegistrationPortType.updateOrganDonorRegistration20180501(request);
        return buildNonCacheableResponse(response);
    }

    @DELETE
    @Path("/deleteOrganDonorRegistration")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteOrganDonorRegistration(@QueryParam("cpr") String cpr) {
        accessControl.checkWriteAccess();
        DeleteOrganDonorRegistrationRequest request = new DeleteOrganDonorRegistrationRequest();
        request.setId(getId(cpr));
        DeleteOrganDonorRegistrationResponse response = organDonorRegistrationPortType.deleteOrganDonorRegistration20180501(request);
        return buildNonCacheableResponse(response);
    }
}


