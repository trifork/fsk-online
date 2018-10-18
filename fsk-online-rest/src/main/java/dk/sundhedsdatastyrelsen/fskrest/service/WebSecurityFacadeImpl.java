package dk.sundhedsdatastyrelsen.fskrest.service;

import com.trifork.web.security.userinfo.UserInfo;
import com.trifork.web.security.userinfo.UserInfoHolder;

public class WebSecurityFacadeImpl implements WebSecurityFacade {
    @Override
    public UserInfo getUserInfo() {
        return UserInfoHolder.get();
    }
}
