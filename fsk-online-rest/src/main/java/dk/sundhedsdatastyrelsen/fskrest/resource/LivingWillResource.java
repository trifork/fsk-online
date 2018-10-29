package dk.sundhedsdatastyrelsen.fskrest.resource;

import dk.sundhedsdatastyrelsen.livstestamente._2018._05._01.*;
import org.apache.log4j.Logger;
import org.hl7.ltr.LivingWill;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/ltr")
@Component
public class LivingWillResource extends AbstractResource {
    Logger logger = Logger.getLogger(LivingWillResource.class);

    @Autowired
    LivingWillPortType livingWillPortType;

    @GET
    @Path("/getLivingWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLivingWill(@QueryParam("cpr") String cpr) {
        accessControl.checkLtrBtrReadAccess();
        GetLivingWillRequest request = new GetLivingWillRequest();
        request.setId(getId(cpr));
        GetLivingWillResponse response = livingWillPortType.getLivingWill20180501(request);
        try {
            LivingWill livingWill = (LivingWill) response.getClinicalDocument().getComponent().getStructuredBody().
                    getComponents().get(0).getSection().getEntries().get(0).getObservation().getValues().get(0);
            return buildNonCacheableResponse(livingWill);
        } catch (Exception e) {
            logger.error("Could not extract livingwill from getresponse: " +  e.getMessage());
            return Response.status(Response.Status.NO_CONTENT).build();
        }
    }

    @GET
    @Path("/hasLivingWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response hasLivingWill(@QueryParam("cpr") String cpr) {
        accessControl.checkLtrBtrReadAccess();
        HasLivingWillRequest request = new HasLivingWillRequest();
        request.setId(getId(cpr));
        HasLivingWillResponse response = livingWillPortType.hasLivingWill20180501(request);
        return buildNonCacheableResponse(response);
    }

    @POST
    @Path("/createLivingWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createLivingWill(@QueryParam("cpr") String cpr, LivingWill livingWill) {
        accessControl.checkWriteAccess();
        CreateLivingWillRequest request = new CreateLivingWillRequest();
        request.setId(getId(cpr));
        request.setLivingWill(livingWill);
        CreateLivingWillResponse response = livingWillPortType.createLivingWill20180501(request);
        return buildNonCacheableResponse(response);
    }

    @PUT
    @Path("/updateLivingWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateLivingWill(@QueryParam("cpr") String cpr, LivingWill livingWill) {
        accessControl.checkWriteAccess();
        UpdateLivingWillRequest request = new UpdateLivingWillRequest();
        request.setId(getId(cpr));
        request.setLivingWill(livingWill);
        UpdateLivingWillResponse response = livingWillPortType.updateLivingWill20180501(request);
        return buildNonCacheableResponse(response);
    }

    @DELETE
    @Path("/deleteLivingWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteLivingWill(@QueryParam("cpr") String cpr) {
        accessControl.checkWriteAccess();
        DeleteLivingWillRequest request = new DeleteLivingWillRequest();
        request.setId(getId(cpr));
        DeleteLivingWillResponse response = livingWillPortType.deleteLivingWill20180501(request);
        return buildNonCacheableResponse(response);
    }
}


