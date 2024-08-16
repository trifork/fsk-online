package dk.sundhedsdatastyrelsen.fskrest.resource;

import dk.fmkonline.server.shared.filter.Log4jExceptionLoggerFilter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import jakarta.xml.ws.WebServiceException;

import static org.apache.commons.lang3.RandomStringUtils.randomAlphanumeric;

@Component
@Provider
public class FSKExceptionMapper implements ExceptionMapper<Exception> {
    private static final Logger log = LogManager.getLogger(FSKExceptionMapper.class);

    private static final int WEBSERVICE_COMMUNICATION_ERROR = 100;

    @Autowired
    private Environment env;

    @Autowired
    private HttpServletRequest request;

    @Override
    public Response toResponse(Exception e){

        final String tag = randomAlphanumeric(5);
        log.info("Created supportTag=" + tag);

        if (e instanceof WebApplicationException we) {
            log.info("User denied access: ", e);
            // It was decided somewhere else what status code to return.
            return Response.fromResponse(we.getResponse()).header(Log4jExceptionLoggerFilter.HTTP_X_SUPPORT_TAG, tag).build();
        }

        FSKFault vaccinationFault;

         if (e instanceof WebServiceException) {
            log.warn("Problem communicating with webservice", e);

            vaccinationFault = new FSKFault();
            vaccinationFault.setMessage("Fejl ved kommunikation med webservice: " + e.getMessage());
            vaccinationFault.setCode(WEBSERVICE_COMMUNICATION_ERROR);
         } else {
             // Runtime errors
             log.error("Unexpected exception", e);
             return Response.status(500).header(Log4jExceptionLoggerFilter.HTTP_X_SUPPORT_TAG, tag).entity(e.getMessage()).build();
         }

        return Response.status(500).header(Log4jExceptionLoggerFilter.HTTP_X_SUPPORT_TAG, tag).entity(vaccinationFault).build();
    }

}
