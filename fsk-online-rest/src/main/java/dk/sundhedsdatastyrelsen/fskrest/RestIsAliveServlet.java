package dk.sundhedsdatastyrelsen.fskrest;

import dk.fmkonline.common.server.isalive.CachingIsAliveServlet;
import dk.fmkonline.common.server.isalive.IsAliveTask;
import dk.fmkonline.common.server.isalive.tasks.IntegrationPointTask;
import dk.fmkonline.common.server.isalive.tasks.UrlRespondingTask;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import java.util.Set;

public class RestIsAliveServlet extends CachingIsAliveServlet {
    private static final long serialVersionUID = 1L;

    @Value("${isalive.odr.url}")
    private String odrWsUrl;

    @Value("${isalive.btr-ltr.url}")
    private String btr_ltr_WsUrl;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        SpringBeanAutowiringSupport.processInjectionBasedOnServletContext(this, config.getServletContext());
    }

    @Override
    protected void addTasks(Set<IsAliveTask> tasks) {
        tasks.add(new UrlRespondingTask(IntegrationPointTask.PointOfIntegration.EXTERNAL, "ODR-WS", odrWsUrl));
        tasks.add(new UrlRespondingTask(IntegrationPointTask.PointOfIntegration.EXTERNAL, "BTR-WS", btr_ltr_WsUrl));
    }
}
