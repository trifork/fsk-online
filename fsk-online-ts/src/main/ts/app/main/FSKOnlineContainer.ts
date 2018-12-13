import {BindingScope, IoC, ReferenceType} from "fmko-ts-ioc";

import {IdSynthesizer, ModuleRegistryFactory, VersionImpl} from "fmko-typescript-common";

import FSKOnlineConfigurationFactory from "./FSKOnlineConfigurationFactory";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import TreatmentWillCache from "../services/TreatmentWillCache";
import LivingWillCache from "../services/LivingWillCache";

const SINGLETON = BindingScope.SINGLETON;
const ROOT_ELEMENT_ID = "fskMain";

export default class FSKOnlineContainer {
    private _ioc: IoC;

    public constructor() {
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

        this._ioc.bind(FSKOrganDonorCache).scopedAs(SINGLETON);
        this._ioc.bind(TreatmentWillCache).scopedAs(SINGLETON);
        this._ioc.bind(LivingWillCache).scopedAs(SINGLETON);
    }

    public resolve(type: ReferenceType) {
        return this._ioc.resolve(type);
    }
}
