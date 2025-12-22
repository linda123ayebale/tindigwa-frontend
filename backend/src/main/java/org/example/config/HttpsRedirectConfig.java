package org.example.config;

import org.apache.catalina.Context;
import org.apache.catalina.connector.Connector;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * HTTPS Redirect Configuration
 * 
 * This configuration allows the application to run on both HTTP and HTTPS:
 * - HTTPS runs on port 8443 (secure)
 * - HTTP runs on port 8081 (redirects to HTTPS in production)
 * 
 * This ensures backward compatibility while adding encryption support.
 */
@Configuration
@Profile("!test") // Don't apply during testing
public class HttpsRedirectConfig {

    /**
     * Configure Tomcat to support both HTTP and HTTPS
     * HTTP requests on port 8081 will be redirected to HTTPS on port 8443
     */
    @Bean
    public ServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
        
        // Add HTTP connector (port 8081) that redirects to HTTPS
        tomcat.addAdditionalTomcatConnectors(createHttpConnector());
        
        return tomcat;
    }

    /**
     * Create HTTP connector that redirects to HTTPS
     */
    private Connector createHttpConnector() {
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setScheme("http");
        connector.setPort(8081);  // HTTP port (your current port)
        connector.setSecure(false);
        connector.setRedirectPort(8443);  // Redirect to HTTPS port
        return connector;
    }
}
