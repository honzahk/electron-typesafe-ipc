# electron-typesafe-ipc

Module for safe inter process communication (IPC) in electron. TypeScript supported.

## Installation

`yarn add electron-typesafe-ipc`

## Usage

configure typesafe ipc object:

```ts
//tsipc.ts
import {createIpcChannel, createTypesafeIpc} from "electron-typesafe-ipc";

//first, describe the ipc communication schema - channel names, their direction (main->rend / rend->main) and type of their params (no params - void)
const ipcSchema = {
	main: {
		//main -> rend communication
		trayItemClick: createIpcChannel<{itemId: number}>({msg: "IPC_TRAY_ITEM_CLICK"}),
		trayLogoutClick: createIpcChannel<void>({msg: "IPC_TRAY_LOGOUT_CLICK"})
	},
	rend: {
		//rend -> main communication
		login: createIpcChannel<{loginEmail: string}>({msg: "IPC_LOGIN"}),
		bringWindowToFront: createIpcChannel<void>({msg: "IPC_BRING_TO_FRONT"})
	}
};

//then we create the typesafe ipc object via library function
export const tsipc = createTypesafeIpc(ipcSchema);
```

use it in main:

```ts
import {tsipc} from "./tsipc.ts";

//register listener
tsipc.main.on.login(({loginEmail}) => {
	//main process received information that user was logged in via renderer process
	//do whatever you want here - ie change tray menu (display logout button)
});

//send message to renderer process (BrowserWindow win - your app window with target renderer process)
tsipc.main.send.trayLogoutClick(win);
```

use it in renderer:

```ts
import {tsipc} from "./tsipc.ts";

//register listener
tsipc.rend.on.trayItemClick(({itemId}) => {
	//renderer process received information that user clicked tray item
	//do whatever you want here
});

//send message to main process
tsipc.rend.send.login({loginEmail: "email@gmail.com"});
```

## API

`...`

## Notes

- by now, this library is designed to support only one renderer process (although it may work across many renderer processes, this is not tested)

## TODO

- [ ] bi-directional channels (both main->rend and rend->main)
- [ ] design API to support multiple renderer processes
- [ ] implement API to support multiple renderer processes
