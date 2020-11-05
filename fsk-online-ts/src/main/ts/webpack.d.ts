interface WebpackRequire {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
}
interface NodeRequire extends WebpackRequire {}
declare let require: NodeRequire;

declare let SCM_VERSION: string;
declare let SCM_BRANCH: string;
declare let BUILD_TIME: string;
declare let POM_VERSION: string;
