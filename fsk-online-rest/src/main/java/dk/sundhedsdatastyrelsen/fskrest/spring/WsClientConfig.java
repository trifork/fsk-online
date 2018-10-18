package dk.sundhedsdatastyrelsen.fskrest.spring;

import com.trifork.web.security.userinfo.OrganisationIdType;
import com.trifork.web.security.userinfo.UserInfo;
import com.trifork.web.security.userinfo.UserInfoHolder;
import dk.fmkonline.common.shared.Role;
import dk.fmkonline.taswsclient.*;
import dk.sundhedsdatastyrelsen.behandlingstestamente._2018._05._01.TreatmentWillPortType;
import dk.sundhedsdatastyrelsen.livstestamente._2018._05._01.LivingWillPortType;
import dk.sundhedsdatastyrelsen.organdonor._2018._05._01.OrganDonorRegistrationPortType;
import org.apache.commons.codec.binary.Base64;
import org.apache.cxf.Bus;
import org.apache.cxf.endpoint.Client;
import org.apache.cxf.frontend.ClientProxy;
import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import org.apache.cxf.transport.http.HTTPConduit;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.core.env.Environment;

import javax.servlet.http.HttpServletRequest;
import javax.xml.soap.SOAPException;
import java.nio.charset.Charset;
import java.util.HashMap;

@Configuration
@ImportResource( {"classpath:META-INF/cxf/cxf.xml"})
public class WsClientConfig {
   @Autowired
    Environment env;

    Logger logger = Logger.getLogger(WsClientConfig.class);

    @Bean
    public IdCardProvider idCardProvider(final HttpServletRequest req) {
        return new IdCardProvider() {
            @Override
            public String getIdCard() {
                String idCardHeader = req.getHeader("X-ID-Card");
                if (idCardHeader == null) {
                    logger.info("No ID-card found for user. Request: " + req.getRequestURI());
                    return null;
                }
                byte[] decodedIdCardBytes = Base64.decodeBase64(idCardHeader);
                return new String(decodedIdCardBytes, Charset.forName("UTF-8"));
            }
        };
    }

    @Bean
    public IdentityTokenProvider identityTokenProvider(final HttpServletRequest req) {
        String audienceName = env.getProperty("idws.audience");

        return new IdentityTokenProvider() {
            @Override
            public String getIdentityToken() {

                String identityTokenHeader = req.getHeader("X-WSC-Token-" + audienceName);
                if (identityTokenHeader == null) {
                    logger.info("No identity token found for user. Request: " + req.getRequestURI());
                    return null;
                }
                byte[] decodedIdCardBytes = Base64.decodeBase64(identityTokenHeader);
                return new String(decodedIdCardBytes, Charset.forName("UTF-8"));
            }
        };
    }

    @Bean
    public RequestedRoleProvider requestedRoleProvider(final HttpServletRequest req) {
        return new RequestedRoleProvider() {
            @Override
            public String getRequestedRole() {
                UserInfo userInfo = UserInfoHolder.get();
                if (userInfo != null) {
                    Role role =  Role.forName(UserInfoHolder.get().requestedRole);
                    return role.getSchemaName();
                } else {
                    return Role.Citizen.getSchemaName();
                }
            }
        };
    }

    @Bean
    public FlowIdProvider flowIdProvider(final HttpServletRequest req) {
        return new FlowIdProvider() {
            @Override
            public String getCurrentFlowId() {
                return req.getHeader("X-Request-Handle");
            }
        };
    }

    @Bean
    OrganisationProvider userInfoProvider() {
        return new OrganisationProvider() {

            @Override
            public String getOrganisationId() {
                return UserInfoHolder.get().organisationId;
            }

            @Override
            public OrganisationIdType getOrganisationIdType() {
                return UserInfoHolder.get().organisationIdType;
            }

            @Override
            public String getOrganisationName() {
                return UserInfoHolder.get().organisationName;
            }
        };
    }

    @Bean
    public DgwsClientMessageHandler dgwsClientMessageHandler(IdCardProvider idCardProvider, FlowIdProvider flowIdProvider) throws SOAPException {
        return new DgwsClientMessageHandler(idCardProvider, flowIdProvider);
    }

    private JaxWsProxyFactoryBean createJaxWsProxyFactoryBean(Bus cxf, Class<?> portType, String wsUrl,
                                                              DgwsClientMessageHandler dgwsClientMessageHandler) {

        final JaxWsProxyFactoryBean bean = new JaxWsProxyFactoryBean();

        bean.setServiceClass(portType);
        bean.setAddress(wsUrl);
        bean.setBus(cxf);
        bean.getHandlers().add(dgwsClientMessageHandler);
        if (env.getProperty("odr.ws.message.content.logging", Boolean.class, true)) {
            int maxLogBytes = env.getProperty("odr.ws.message.content.logging.max.length", Integer.class, 1000 * 1024);
            logger.info("MinLogClient (DGWS) client: Logging of full message content enabled");
            bean.getInInterceptors().add(new LoggingInInterceptor(maxLogBytes));
            bean.getOutInterceptors().add(new LoggingOutInterceptor(maxLogBytes));
        }

        HashMap<String, Object> props = new HashMap<>();
        props.put("schema-validation-enabled", true);
        bean.setProperties(props);

        return bean;
    }

    @Bean
    @Qualifier("jaxWsProxyFactoryBean_odr")
    public JaxWsProxyFactoryBean jaxWsProxyFactoryBean_odr(Bus cxf,
                                                           DgwsClientMessageHandler dgwsClientMessageHandler) {
        return createJaxWsProxyFactoryBean(cxf, OrganDonorRegistrationPortType.class, env.getProperty("odr.ws.url"),
                dgwsClientMessageHandler);
    }

    @Bean
    @Qualifier("jaxWsProxyFactoryBean_ltr")
    public JaxWsProxyFactoryBean jaxWsProxyFactoryBean_ltr(Bus cxf,
                                                           DgwsClientMessageHandler dgwsClientMessageHandler) {
        return createJaxWsProxyFactoryBean(cxf, LivingWillPortType.class, env.getProperty("ltr.ws.url"),
                dgwsClientMessageHandler);
    }

    @Bean
    @Qualifier("jaxWsProxyFactoryBean_btr")
    public JaxWsProxyFactoryBean jaxWsProxyFactoryBean_btr(Bus cxf,
                                                           DgwsClientMessageHandler dgwsClientMessageHandler) {
        return createJaxWsProxyFactoryBean(cxf, TreatmentWillPortType.class, env.getProperty("btr.ws.url"),
                dgwsClientMessageHandler);
    }


    @Bean
    public OrganDonorRegistrationPortType organDonorRegistrationPort(@Qualifier("jaxWsProxyFactoryBean_odr") JaxWsProxyFactoryBean jaxWsProxyFactoryBean) {
        OrganDonorRegistrationPortType client = jaxWsProxyFactoryBean.create(OrganDonorRegistrationPortType.class);
        Client cl = ClientProxy.getClient(client);
        HTTPConduit httpConduit = (HTTPConduit) cl.getConduit();
        httpConduit.getClient().setReceiveTimeout( env.getProperty("ws.receive.timeout", Integer.class, 60000));
        return client;
    }

    @Bean
    public LivingWillPortType livingWillPort(@Qualifier("jaxWsProxyFactoryBean_ltr") JaxWsProxyFactoryBean jaxWsProxyFactoryBean) {
        LivingWillPortType client = jaxWsProxyFactoryBean.create(LivingWillPortType.class);
        Client cl = ClientProxy.getClient(client);
        HTTPConduit httpConduit = (HTTPConduit) cl.getConduit();
        httpConduit.getClient().setReceiveTimeout( env.getProperty("ws.receive.timeout", Integer.class, 60000));
        return client;
    }

    @Bean
    public TreatmentWillPortType treatmentWillPortType(@Qualifier("jaxWsProxyFactoryBean_btr") JaxWsProxyFactoryBean jaxWsProxyFactoryBean) {
        TreatmentWillPortType client = jaxWsProxyFactoryBean.create(TreatmentWillPortType.class);
        Client cl = ClientProxy.getClient(client);
        HTTPConduit httpConduit = (HTTPConduit) cl.getConduit();
        httpConduit.getClient().setReceiveTimeout( env.getProperty("ws.receive.timeout", Integer.class, 60000));
        return client;
    }
}
