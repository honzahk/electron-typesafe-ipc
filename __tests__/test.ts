import {createIpcChannel, createTypesafeIpc} from "../dist/index";
import {BrowserWindow} from "electron";

//first, describe the ipc communication schema - channel names, their direction (main->rend / rend->main) and type of their params (no params - void)
const ipcSchema = {
	main: {
		//main->rend communication
		mainItemClickAdd: createIpcChannel<{itemId: string}>({msg: "IPC_MAIN_ITEM_CLICK_ADD"}),
		mainItemClickRemove: createIpcChannel<{itemId: string}>({msg: "IPC_MAIN_ITEM_CLICK_REMOVE"})
	},
	rend: {
		//rend->main communication
		rendItemClickAdd: createIpcChannel<{itemId: string}>({msg: "IPC_REND_ITEM_CLICK_ADD"}),
		rendItemClickRemove: createIpcChannel<{itemId: string}>({msg: "IPC_REND_ITEM_CLICK_ADD"})
	},
	both: {
		//bidirectional communication (both, main->rend and rend->main communication)
		syncItems: createIpcChannel<{itemIds: string[]}>({msg: "IPC_SYNC_ITEMS"})
	}
};

//then we create the typesafe ipc object via library function
export const tsipc = createTypesafeIpc(ipcSchema);

const b: BrowserWindow = new BrowserWindow();
tsipc.main.send.syncItems(b, {itemIds: ["c"]});
tsipc.main.removeAll.syncItems();
