package dk.sundhedsdatastyrelsen.fskrest.resource;

import dk.fmkonline.server.shared.filter.Log4jExceptionLoggerFilter;
import org.apache.cxf.interceptor.security.AccessDeniedException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import javax.xml.ws.WebServiceException;

import static org.apache.commons.lang3.RandomStringUtils.randomAlphanumeric;

@Component
@Provider
public class FSKExceptionMapper implements ExceptionMapper<Exception> {
    private static Logger logger = Logger.getLogger(FSKExceptionMapper.class);

    private static final int WEBSERVICE_COMMUNICATION_ERROR = 100;
    private static final int ACCESS_DENIED_ERROR = 200;

    @Autowired
    private Environment env;

    @Autowired
    private HttpServletRequest request;

    @Override
    public Response toResponse(Exception e){

        final String tag = randomAlphanumeric(5);
        logger.info("Created supportTag=" + tag);

        if (e instanceof WebApplicationException) {
            // It was decided somewhere else what status code to return.
            WebApplicationException we = (WebApplicationException) e;

            return Response.fromResponse(we.getResponse()).header(Log4jExceptionLoggerFilter.HTTP_X_SUPPORT_TAG, tag).build();
        }

        FSKFault vaccinationFault;

         if (e instanceof WebServiceException) {
            logger.warn("Problem communicating with webservice", e);

            vaccinationFault = new FSKFault();
            vaccinationFault.setMessage("Fejl ved kommunikation med webservice: " + e.getMessage());
            vaccinationFault.setCode(WEBSERVICE_COMMUNICATION_ERROR);

         } else if (e instanceof AccessDeniedException) {
             logger.warn("Problem communicating with webservice", e);

             vaccinationFault = new FSKFault();
             vaccinationFault.setMessage("Fejl ved kommunikation med webservice: " + e.getMessage());
             vaccinationFault.setCode(ACCESS_DENIED_ERROR);
         } else {
             // Runtime errors
             logger.error("Unexpected exception", e);
             return Response.status(500).header(Log4jExceptionLoggerFilter.HTTP_X_SUPPORT_TAG, tag).entity(e.getMessage()).build();
         }

        return Response.status(500).header(Log4jExceptionLoggerFilter.HTTP_X_SUPPORT_TAG, tag).entity(vaccinationFault).build();
    }

}
