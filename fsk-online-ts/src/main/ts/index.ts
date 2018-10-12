// Resolve the module, and "kick off" it's execution (register it!)
import FSKOnlineContainer from "./app/main/FSKOnlineContainer";
import FSKOnlineModule from "./app/main/FSKOnlineModule";

const container = new FSKOnlineContainer();
const module = new FSKOnlineModule(container);
module.register();
