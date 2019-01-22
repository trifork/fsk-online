interface WebpackRequire {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
}
interface NodeRequire extends WebpackRequire {}
declare var require: NodeRequire;

declare var SCM_VERSION: string;
declare var SCM_BRANCH: string;
declare var BUILD_TIME: string;
declare var POM_VERSION: string;
