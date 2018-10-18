package dk.sundhedsdatastyrelsen.fskrest.service;

import com.trifork.web.security.userinfo.UserInfo;

public interface WebSecurityFacade {
    public abstract UserInfo getUserInfo();
}
