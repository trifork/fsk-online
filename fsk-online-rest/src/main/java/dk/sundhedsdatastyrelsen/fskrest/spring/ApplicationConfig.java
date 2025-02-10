// Decompiled by Jad v1.5.8g. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.kpdus.com/jad.html
// Decompiler options: packimports(3)
// Source File Name:   ApplicationConfig.java

package dk.sundhedsdatastyrelsen.fskrest.spring;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@ComponentScan(basePackages = {"dk.sundhedsdatastyrelsen.fskrest"})
@Import({PropertyConfig.class, WebConfig.class, WsClientConfig.class})
public class ApplicationConfig {
}
