// Decompiled by Jad v1.5.8g. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.kpdus.com/jad.html
// Decompiler options: packimports(3)
// Source File Name:   ApplicationConfig.java

package dk.sundhedsdatastyrelsen.fskrest.spring;

import dk.fmkonline.server.shared.audit.AuditLogBackend;
import dk.fmkonline.server.shared.audit.Log4jBackend;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@ComponentScan(basePackages = {"dk.sundhedsdatastyrelsen.fskrest"})
@Import({PropertyConfig.class, WebConfig.class, WsClientConfig.class})
public class ApplicationConfig {

    @Bean
    public AuditLogBackend log4jAuditLog() {
        return new Log4jBackend();
    }
}
