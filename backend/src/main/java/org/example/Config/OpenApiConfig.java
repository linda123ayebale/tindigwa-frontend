package org.example.Config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI expenseModuleOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8080");
        devServer.setDescription("Development Server");
        
        Contact contact = new Contact();
        contact.setName("Tindigwa Development Team");
        contact.setEmail("support@tindigwa.com");
        
        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");
        
        Info info = new Info()
                .title("Tindigwa Expenses Management API")
                .version("2.0")
                .contact(contact)
                .description("API for managing expense categories and operational expenses. " +
                        "This API provides endpoints for creating, reading, updating, and deleting " +
                        "expense categories and expenses with proper validation and error handling.")
                .license(license);
        
        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer));
    }
}
