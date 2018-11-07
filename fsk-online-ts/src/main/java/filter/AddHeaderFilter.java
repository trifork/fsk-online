package filter;
import java.io.IOException;
import java.util.regex.Pattern;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class AddHeaderFilter implements Filter {

    protected Pattern includePattern;
    protected Pattern excludePattern;
    protected String headerName;
    protected String headerValue;

    public void destroy() {
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        if (excludePattern == null || !excludePattern.matcher(((HttpServletRequest)request).getRequestURI()).matches()) {
            if (includePattern == null || includePattern.matcher(((HttpServletRequest)request).getRequestURI()).matches()) {
                if (headerValue != null) {
                    ((HttpServletResponse) response).setHeader(headerName, headerValue);
                }
            }
        }

        chain.doFilter(request, response);
    }

    public void init(FilterConfig config) throws ServletException {
        String includeFilter = config.getInitParameter("include-pattern");
        if (includeFilter!=null) {
            includePattern = Pattern.compile(includeFilter);
        }

        String excludeFilter = config.getInitParameter("exclude-pattern");
        if (excludeFilter!=null) {
            excludePattern = Pattern.compile(excludeFilter);
        }

        headerName = config.getInitParameter("header-name");
        headerValue = config.getInitParameter("header-value");
    }
}
