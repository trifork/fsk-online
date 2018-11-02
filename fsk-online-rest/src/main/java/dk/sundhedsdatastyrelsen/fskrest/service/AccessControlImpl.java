package dk.sundhedsdatastyrelsen.fskrest.service;

import com.trifork.web.security.userinfo.UserInfo;
import com.trifork.web.security.userinfo.UserInfoHolder;
import dk.fmkonline.common.shared.Role;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;

@Component
public class AccessControlImpl implements AccessControl {
    private static Logger logger = Logger.getLogger(AccessControlImpl.class);

    private static String SYSTEM_NAME = "FSK";

    @Override
    public void checkOdrReadAccess() {
        UserInfo userInfo = UserInfoHolder.get();
        boolean isAuthorized = (Role.Supporter.getName().equals(userInfo.requestedRole)
                || Role.WebAdmin.getName().equals(userInfo.requestedRole));
        if (isAuthorized) {
            isAuthorized &= userInfo.requestedRoleSystemRestrictionList.contains(SYSTEM_NAME);
        }

        if (!isAuthorized) {
            logger.info("Denying access to read organdonorregistration for user " + userInfo.cpr + " in role "
                    + userInfo.requestedRole);
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
    }

    @Override
    public void checkLtrBtrReadAccess() {
        UserInfo userInfo = UserInfoHolder.get();
        boolean isAdmin = Role.WebAdmin.getName().equals(userInfo.requestedRole);
        boolean isAuthorized = isAdmin
                || !StringUtils.isBlank(userInfo.authNo);
        if (isAdmin) {
            isAuthorized &= userInfo.requestedRoleSystemRestrictionList.contains(SYSTEM_NAME);
        }

        if (!isAuthorized) {
            logger.info("Denying access to read livingwill / treatmentwill for user " + userInfo.cpr + " in role "
                    + userInfo.requestedRole);
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
    }

    @Override
    public void checkWriteAccess() {
        UserInfo userInfo = UserInfoHolder.get();
        boolean isAuthorized = Role.WebAdmin.getName().equals(userInfo.requestedRole);
        if (isAuthorized) {
            isAuthorized &= userInfo.requestedRoleSystemRestrictionList.contains(SYSTEM_NAME);
        }

        if (!isAuthorized) {
            logger.info("Denying access to write for user " + userInfo.cpr + " in role "
                    + userInfo.requestedRole);
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }
    }
}
