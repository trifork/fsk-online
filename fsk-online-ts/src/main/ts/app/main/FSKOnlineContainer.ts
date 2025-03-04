import {BindingScope, IoC, ReferenceType} from "fmko-ts-ioc";

import {IdSynthesizer, ModuleRegistryFactory, VersionImpl} from "fmko-ts-common";

import FSKOnlineConfigurationFactory from "./FSKOnlineConfigurationFactory";

const SINGLETON = BindingScope.SINGLETON;
const ROOT_ELEMENT_ID = "fskMain";

export default class FSKOnlineContainer {
    private _ioc: IoC;

    constructor() {
        this._ioc = new IoC();

        this._ioc.bind(ModuleRegistryFactory)
            .withFactoryFunction(() => ModuleRegistryFactory.getInstance())
            .scopedAs(SINGLETON);
        this._ioc.bind("ModuleContext")
            .withFactoryFunction((resolve) => resolve(ModuleRegistryFactory).getModuleContext())
            .scopedAs(SINGLETON);
        this._ioc.bind("FSKConfig")
            .withFactoryFunction((resolve) => FSKOnlineConfigurationFactory.createInstance(resolve("ModuleContext")))
            .scopedAs(SINGLETON);
        this._ioc.bind("RootElement")
            .withFactoryFunction(() => document.getElementById(ROOT_ELEMENT_ID))
            .scopedAs(SINGLETON);
        this._ioc.bind(IdSynthesizer)
            .withFactoryFunction(() => {
                return new IdSynthesizer("fsk-online_");
            }).scopedAs(SINGLETON);
        this._ioc.bind(`Version`)
            .withFactoryFunction(() => {
                return new VersionImpl(SCM_VERSION, SCM_BRANCH, BUILD_TIME, POM_VERSION);
            })
            .scopedAs(SINGLETON);

    }

    public resolve<T>(type: ReferenceType<T>) {
        return this._ioc.resolve<T>(type);
    }
}
