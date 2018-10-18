// Decompiled by Jad v1.5.8g. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.kpdus.com/jad.html
// Decompiler options: packimports(3)
// Source File Name:   WebConfig.java

package dk.sundhedsdatastyrelsen.fskrest.spring;

import dk.sundhedsdatastyrelsen.fskrest.service.WebSecurityFacade;
import dk.sundhedsdatastyrelsen.fskrest.service.WebSecurityFacadeImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {

    @Bean
    public WebSecurityFacade webSecurityFacade() {
        return new WebSecurityFacadeImpl();
    }

}
