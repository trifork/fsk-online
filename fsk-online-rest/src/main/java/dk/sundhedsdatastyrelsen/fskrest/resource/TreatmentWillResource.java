package dk.sundhedsdatastyrelsen.fskrest.resource;

import dk.sundhedsdatastyrelsen.behandlingstestamente._2018._05._01.*;
import org.apache.log4j.Logger;
import org.hl7.btr.TreatmentWill;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/btr")
@Component
public class TreatmentWillResource extends AbstractResource {
    Logger logger = Logger.getLogger(TreatmentWillResource.class);

    @Autowired
    TreatmentWillPortType treatmentWillPortType;

    @Autowired
    TreatmentWillResponseWrapper treatmentWillResponseWrapper;

    @GET
    @Path("/getTreatmentWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTreatmentWill(@QueryParam("cpr") String cpr) {
        accessControl.checkLtrBtrReadAccess();
        GetTreatmentWillRequest request = new GetTreatmentWillRequest();
        request.setId(getId(cpr));
        GetTreatmentWillResponse response = treatmentWillPortType.getTreatmentWill20180501(request);

        try {
            String datetime = response.getClinicalDocument().getAuthors().get(0).getTime().getValue();
            TreatmentWill treatmentWill = (TreatmentWill) response.getClinicalDocument().getComponent().getStructuredBody().
                    getComponents().get(0).getSection().getEntries().get(0).getObservation().getValues().get(0);

            treatmentWillResponseWrapper.setDatetime(datetime);
            treatmentWillResponseWrapper.setRegistrationType(treatmentWill);
            return buildNonCacheableResponse(treatmentWillResponseWrapper);
        } catch (Exception e) {
            logger.error("Error extracting treatmentwill from response: " +  e.getMessage());
            return Response.status(Response.Status.NO_CONTENT).build();
        }
    }

    @GET
    @Path("/hasTreatmentWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response hasTreatmentWill(@QueryParam("cpr") String cpr) {
        accessControl.checkLtrBtrReadAccess();
        HasTreatmentWillRequest request = new HasTreatmentWillRequest();
        request.setId(getId(cpr));
        HasTreatmentWillResponse response = treatmentWillPortType.hasTreatmentWill20180501(request);
        return buildNonCacheableResponse(response);
    }

    @POST
    @Path("/createTreatmentWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createTreatmentWill(@QueryParam("cpr") String cpr, TreatmentWill treatmentWill) {
        accessControl.checkWriteAccess();
        CreateTreatmentWillRequest request = new CreateTreatmentWillRequest();
        request.setId(getId(cpr));
        request.setTreatmentWill(treatmentWill);
        CreateTreatmentWillResponse response = treatmentWillPortType.createTreatmentWill20180501(request);
        return buildNonCacheableResponse(response);
    }

    @PUT
    @Path("/updateTreatmentWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateTreatmentWill(@QueryParam("cpr") String cpr, TreatmentWill treatmentWill) {
        accessControl.checkWriteAccess();
        UpdateTreatmentWillRequest request = new UpdateTreatmentWillRequest();
        request.setId(getId(cpr));
        request.setTreatmentWill(treatmentWill);
        UpdateTreatmentWillResponse response = treatmentWillPortType.updateTreatmentWill20180501(request);
        return buildNonCacheableResponse(response);
    }

    @DELETE
    @Path("/deleteTreatmentWill")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteTreatmentWill(@QueryParam("cpr") String cpr) {
        accessControl.checkWriteAccess();
        DeleteTreatmentWillRequest request = new DeleteTreatmentWillRequest();
        request.setId(getId(cpr));
        DeleteTreatmentWillResponse response = treatmentWillPortType.deleteTreatmentWill20180501(request);
        return buildNonCacheableResponse(response);
    }
}


