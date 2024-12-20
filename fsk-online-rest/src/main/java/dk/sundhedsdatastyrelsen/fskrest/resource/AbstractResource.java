package dk.sundhedsdatastyrelsen.fskrest.resource;

import dk.sundhedsdatastyrelsen.fskrest.service.AccessControl;
import org.hl7.v3.II;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;

public class AbstractResource {
    private final String cprRoot = "1.2.208.176.1.2";
    private final String cprAssigningAuthority = "CPR";

    @Context
    HttpServletRequest servletRequest;

    @Autowired
    protected AccessControl accessControl;

    protected Response buildNonCacheableResponse(Object returnedObject) {
        if (returnedObject == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        Response.ResponseBuilder rb = Response.ok(returnedObject);
        rb = rb.header("Cache-Control", "no-store, no-cache");
        return rb.build();
    }

    protected II getId(String cpr) {
        II id = new II();
        id.setExtension(cpr);
        id.setRoot(cprRoot);
        id.setAssigningAuthorityName(cprAssigningAuthority);
        return id;
    }
}
