package dk.sundhedsdatastyrelsen.fskrest;

import dk.fmkonline.common.server.isalive.CachingIsAliveServlet;
import dk.fmkonline.common.server.isalive.IsAliveTask;
import dk.fmkonline.common.server.isalive.tasks.IntegrationPointTask;
import dk.fmkonline.common.server.isalive.tasks.UrlRespondingTask;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import java.util.Set;

public class RestIsAliveServlet extends CachingIsAliveServlet {
    private static final long serialVersionUID = 1L;

    @Value("${isalive.fsk.url}")
    private String fskWsUrl;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        SpringBeanAutowiringSupport.processInjectionBasedOnServletContext(this, config.getServletContext());
    }

    @Override
    protected void addTasks(Set<IsAliveTask> tasks) {
        tasks.add(new UrlRespondingTask(IntegrationPointTask.PointOfIntegration.INTERNAL, "FSK-WS", fskWsUrl));
    }
}
