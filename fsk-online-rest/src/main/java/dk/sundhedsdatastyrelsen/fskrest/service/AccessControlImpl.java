package dk.sundhedsdatastyrelsen.fskrest.service;

import com.trifork.web.security.userinfo.UserInfo;
import com.trifork.web.security.userinfo.UserInfoHolder;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AccessControlImpl implements AccessControl {
    Logger log = Logger.getLogger(AccessControlImpl.class);

    @Value("${whitelisted.cvrs:}")
    private String whitelistedCVRs;

    private boolean contains = false;

    @Override
    public boolean checkAccess() {
        UserInfo userInfo = UserInfoHolder.get();
        if (userInfo != null && userInfo.cvr != null) {
            contains = whitelistedCVRs.contains(userInfo.cvr);
            if (!contains) {
                log.error("Adgang til at foretage dette kald er ikke tilladt");
            }
        }
        return contains;
    }
}
