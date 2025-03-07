ARG VERSION
ARG T4_VERSION=6.0.1
ARG JAVA_VERSION=21
ARG BASE_IMAGE=registry.fmk.netic.dk/devops/fmkbase:${JAVA_VERSION}

FROM registry.fmk.netic.dk/fmk/t4:${T4_VERSION}-jdk${JAVA_VERSION} AS base
ARG VERSION
ARG USERID=2000

ENV T4_ARCHIVE_APP_NAME=fmk-online-fsk
ENV T4_ARCHIVE_SYSTEM_NAME=fmk-online-fsk
ENV T4_ARCHIVE_FILE_NAME=fsk-online-all-${VERSION}.war

ENV T4_ENDPOINT=REDESIGN_ENDPOINT
ENV T4_ENDPOINT_PORT=8080

COPY fsk-online-all/target/${T4_ARCHIVE_FILE_NAME} ${T4_STAGING_DIR}

RUN chmod 777 ${T4_STAGING_DIR}/startT4AndDeploy.sh
RUN ${T4_STAGING_DIR}/startT4AndDeploy.sh

# Minimize size
FROM ${BASE_IMAGE}
ARG USERID
ARG T4_VERSION

ENV TZ=Europe/Copenhagen
ENV T4_INSTALL_BASE_DIR=/pack
ENV T4_INSTALL_DIR=${T4_INSTALL_BASE_DIR}/trifork-${T4_VERSION}
ENV T4_DOMAIN=default
ENV T4_SERVER_NAME=${T4_DOMAIN}
#ENV T4_JAVA_OPTS='-vmargs=-XX:+UseG1GC -vmargs=-XX:+UseStringDeduplication -vmargs=-Dfile.encoding=UTF-8 -vmargs=-XX:MaxJavaStackTraceDepth=2048'

ENV TRIFORK_SERVER_NAME=${T4_SERVER_NAME}
ENV TRIFORK_DOMAIN_DIR=${T4_INSTALL_DIR}/domains/${T4_DOMAIN}
ENV TRIFORK_USER_CP=${TRIFORK_DOMAIN_DIR}/config/${T4_SERVER_NAME}

RUN mkdir -p ${T4_INSTALL_DIR}
RUN ln -s ${T4_INSTALL_DIR} ${T4_INSTALL_BASE_DIR}/trifork
RUN addgroup --system fmk-online-fsk --gid ${USERID} && adduser --system --gid ${USERID} --uid ${USERID} --home /usr/fmk-online-fsk fmk-online-fsk
USER fmk-online-fsk:fmk-online-fsk
COPY --from=base --chown=fmk-online-fsk /${T4_INSTALL_DIR}/ /${T4_INSTALL_DIR}/
COPY src/main/resources/fsk-config.properties ${T4_INSTALL_DIR}/domains/${T4_DOMAIN}/config/${T4_SERVER_NAME}/

CMD ["/bin/bash", "-c", "${T4_INSTALL_DIR}/domains/${T4_DOMAIN}/bin/trifork server start ${T4_JAVA_OPTS}"]
# docker build -t registry.fmk.netic.dk/fmkonline/vsd --build-arg VERSION=3.2.0-SNAPSHOT -f docker/Dockerfile .
