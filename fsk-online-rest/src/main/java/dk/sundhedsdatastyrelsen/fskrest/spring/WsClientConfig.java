package dk.sundhedsdatastyrelsen.fskrest.spring;

import static dk.fmkonline.common.shared.SharedHeaders.IDCARD_HEADER_NAME;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;

import org.apache.commons.codec.binary.Base64;
import org.apache.cxf.Bus;
import org.apache.cxf.endpoint.Client;
import org.apache.cxf.frontend.ClientProxy;
import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import org.apache.cxf.transport.http.HTTPConduit;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.core.env.Environment;

import com.trifork.web.security.userinfo.OrganisationIdType;
import com.trifork.web.security.userinfo.UserInfo;
import com.trifork.web.security.userinfo.UserInfoHolder;

import dk.fmkonline.common.shared.IRole;
import dk.fmkonline.common.shared.Role;
import dk.fmkonline.dgwsidwsclient.DgwsClientMessageHandler;
import dk.fmkonline.dgwsidwsclient.FlowIdProvider;
import dk.fmkonline.dgwsidwsclient.IdCardProvider;
import dk.fmkonline.dgwsidwsclient.OrganisationProvider;
import dk.fmkonline.dgwsidwsclient.RequestedRoleProvider;
import dk.sundhedsdatastyrelsen.behandlingstestamente._2020._03._16.TreatmentWillPortType;
import dk.sundhedsdatastyrelsen.livstestamente._2018._05._01.LivingWillPortType;
import dk.sundhedsdatastyrelsen.organdonor._2018._05._01.OrganDonorRegistrationPortType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.xml.soap.SOAPException;

@Configuration
@ImportResource({"classpath:META-INF/cxf/cxf.xml"})
public class WsClientConfig {
    private static final Logger log = LogManager.getLogger(WsClientConfig.class);

    @Autowired
    Environment env;

    @Bean
    public IdCardProvider idCardProvider(final HttpServletRequest req) {
        return () -> {
            String idCardHeader = req.getHeader(IDCARD_HEADER_NAME);
            if (idCardHeader == null) {
                log.info("No ID-card found for user. Request: " + req.getRequestURI());
                return null;
            }
            byte[] decodedIdCardBytes = Base64.decodeBase64(idCardHeader);
            return new String(decodedIdCardBytes, StandardCharsets.UTF_8);
        };
    }

    @Bean
    public RequestedRoleProvider requestedRoleProvider(final HttpServletRequest req) {
        return () -> {
            UserInfo userInfo = UserInfoHolder.get();
            if (userInfo != null) {
                IRole role = Role.forName(UserInfoHolder.get().requestedRole);
                return role.getSchemaName();
            } else {
                return Role.Citizen.getSchemaName();
            }
        };
    }

    @Bean
    public FlowIdProvider flowIdProvider(final HttpServletRequest req) {
        return () -> req.getHeader("X-Request-Handle");
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
        if (env.getProperty("ws.message.content.logging", Boolean.class, true)) {
            int maxLogBytes = env.getProperty("ws.message.content.logging.max.length", Integer.class, 1000 * 1024);
            log.info("MinLogClient client: Logging of full message content enabled");
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
        httpConduit.getClient().setReceiveTimeout(env.getProperty("ws.receive.timeout", Integer.class, 60000));
        return client;
    }

    @Bean
    public LivingWillPortType livingWillPort(@Qualifier("jaxWsProxyFactoryBean_ltr") JaxWsProxyFactoryBean jaxWsProxyFactoryBean) {
        LivingWillPortType client = jaxWsProxyFactoryBean.create(LivingWillPortType.class);
        Client cl = ClientProxy.getClient(client);
        HTTPConduit httpConduit = (HTTPConduit) cl.getConduit();
        httpConduit.getClient().setReceiveTimeout(env.getProperty("ws.receive.timeout", Integer.class, 60000));
        return client;
    }

    @Bean
    public TreatmentWillPortType treatmentWillPortType(@Qualifier("jaxWsProxyFactoryBean_btr") JaxWsProxyFactoryBean jaxWsProxyFactoryBean) {
        TreatmentWillPortType client = jaxWsProxyFactoryBean.create(TreatmentWillPortType.class);
        Client cl = ClientProxy.getClient(client);
        HTTPConduit httpConduit = (HTTPConduit) cl.getConduit();
        httpConduit.getClient().setReceiveTimeout(env.getProperty("ws.receive.timeout", Integer.class, 60000));
        return client;
    }
}
