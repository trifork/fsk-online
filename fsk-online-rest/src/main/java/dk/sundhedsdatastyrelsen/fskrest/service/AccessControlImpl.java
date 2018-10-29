package dk.sundhedsdatastyrelsen.fskrest.service;

import com.trifork.web.security.userinfo.UserInfo;
import com.trifork.web.security.userinfo.UserInfoHolder;
import dk.fmkonline.common.shared.Role;
import org.apache.commons.lang3.StringUtils;
import org.apache.cxf.interceptor.security.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class AccessControlImpl implements AccessControl {

    private final String ACCESS_DENIED_MESSAGE = "Ingen rettigheder til at udføre handling";


    @Override
    public void checkOdrReadAccess() {
        UserInfo userInfo = UserInfoHolder.get();
        final boolean isAuthorized = Role.Supporter.getName().equals(userInfo.requestedRole)
                || Role.WebAdmin.getName().equals(userInfo.requestedRole);

        if (!isAuthorized) {
            throw new AccessDeniedException(ACCESS_DENIED_MESSAGE);
        }
    }

    @Override
    public void checkLtrBtrReadAccess() {
        UserInfo userInfo = UserInfoHolder.get();
        final boolean isAuthorized = Role.WebAdmin.getName().equals(userInfo.requestedRole)
                || !StringUtils.isBlank(userInfo.authNo);

        if (!isAuthorized) {
            throw new AccessDeniedException(ACCESS_DENIED_MESSAGE);
        }
    }

    @Override
    public void checkWriteAccess() {
        UserInfo userInfo = UserInfoHolder.get();
        final boolean isAuthorized = Role.WebAdmin.getName().equals(userInfo.requestedRole);

        if (!isAuthorized) {
            throw new AccessDeniedException(ACCESS_DENIED_MESSAGE);
        }
    }
}
