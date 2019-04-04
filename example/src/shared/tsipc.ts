import {createIpcChannel, createTypesafeIpc} from "electron-typesafe-ipc";
import {TIpcSchema} from "electron-typesafe-ipc/tsipc";

//first, describe the ipc communication schema - channel names, their direction (main->rend / rend->main) and type of their params (no params - void)
const ipcSchema: TIpcSchema = {
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
		//bidirectional communication (both, main->rend and rend->main)
	}
};

//then we create the typesafe ipc object via library function
export const tsipc = createTypesafeIpc(ipcSchema);
