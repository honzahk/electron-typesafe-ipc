import {ipcRenderer, ipcMain, BrowserWindow} from "electron";

type TIpcMainSendFunction<TIpcParam> = (win: BrowserWindow, params: TIpcParam) => void;
type TIpcRendererSendFunction<TIpcParam> = (params: TIpcParam) => void;
type TIpcOnFunction<TIpcParam> = (callback: (params: TIpcParam, e) => void) => void;
type TIpcOnceFunction<TIpcParam> = TIpcOnFunction<TIpcParam>; //typeof once == typeof on
type TIpcRemoveFunction = () => void;
type TIpcRemoveAllFunction = () => void;

/**
 * output tsipc object type - interface for consumer
 */
// prettier-ignore
type TIpcOutput<T extends TIpcSchema> = {
	main: {
		send: 
			{[K in keyof T["main"]]: TIpcMainSendFunction<T["main"][K]["param"]>} &
			{[K in keyof T["both"]]: TIpcMainSendFunction<T["both"][K]["param"]>};
		on: 
			{[K in keyof T["rend"]]: TIpcOnFunction<T["rend"][K]["param"]>} &
			{[K in keyof T["both"]]: TIpcOnFunction<T["both"][K]["param"]>};
		once: 
			{[K in keyof T["rend"]]: TIpcOnceFunction<T["rend"][K]["param"]>} &
			{[K in keyof T["both"]]: TIpcOnceFunction<T["both"][K]["param"]>};
		remove: 
			{[K in keyof T["rend"]]: TIpcRemoveFunction} &
			{[K in keyof T["both"]]: TIpcRemoveFunction};
		removeAll:
			{[K in keyof T["rend"]]: TIpcRemoveAllFunction} &
			{[K in keyof T["both"]]: TIpcRemoveAllFunction};
	};
	rend: {
		send: 
			{[K in keyof T["rend"]]: TIpcRendererSendFunction<T["rend"][K]["param"]>} &
			{[K in keyof T["both"]]: TIpcRendererSendFunction<T["both"][K]["param"]>};
		on: 
			{[K in keyof T["main"]]: TIpcOnFunction<T["main"][K]["param"]>} &
			{[K in keyof T["both"]]: TIpcOnFunction<T["both"][K]["param"]>};
		once: 
			{[K in keyof T["main"]]: TIpcOnceFunction<T["main"][K]["param"]>} &
			{[K in keyof T["both"]]: TIpcOnceFunction<T["both"][K]["param"]>};
		remove: 
			{[K in keyof T["main"]]: TIpcRemoveFunction} &
			{[K in keyof T["both"]]: TIpcRemoveFunction};
		removeAll:
			{[K in keyof T["main"]]: TIpcRemoveAllFunction} &
			{[K in keyof T["both"]]: TIpcRemoveAllFunction};
			
	};
};

type TChannelKey = string;
type TChannelMsg = string;

class IpcUtil<T extends TIpcSchema> {
	public registeredListeners = {
		main: {},
		rend: {}
	};

	public interface: TIpcOutput<T> = {
		main: {send: {}, on: {}, once: {}, remove: {}, removeAll: {}},
		rend: {send: {}, on: {}, once: {}, remove: {}, removeAll: {}}
	} as any;

	// ###############################################################################################################
	constructor(ipcSchema: TIpcSchema) {
		for (let key in ipcSchema["main"]) {
			this.registerMainToRend(key, ipcSchema["main"][key]);
		}

		for (let key in ipcSchema["rend"]) {
			this.registerRendToMain(key, ipcSchema["rend"][key]);
		}

		for (let key in ipcSchema["both"]) {
			this.registerMainToRend(key, ipcSchema["both"][key]);
			this.registerRendToMain(key, ipcSchema["both"][key]);
		}
	}

	// ###############################################################################################################
	registerMainToRend(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.registerMainSend(key, ipcChannelSchema);
		this.registerRendOn(key, ipcChannelSchema);
		this.registerRendOnce(key, ipcChannelSchema);
		this.registerRendRemove(key, ipcChannelSchema);
		this.registerRendRemoveAll(key, ipcChannelSchema);
	}

	registerMainSend(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.main.send[key] = (win: BrowserWindow, params: typeof ipcChannelSchema.param) => {
			win.webContents.send(ipcChannelSchema.msg, params);
		};
	}

	registerMainOn(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.main.on[key] = (callback: (params: typeof ipcChannelSchema.param, e) => void) => {
			const listeners = this.registeredListeners.main;
			if (listeners[ipcChannelSchema.msg] != null) {
				throw new Error("Cannot register multiple listeners on a single message");
			}
			listeners[ipcChannelSchema.msg] = (e, params) => callback(params, e);
			ipcMain.on(ipcChannelSchema.msg, listeners[ipcChannelSchema.msg]);
		};
	}

	registerMainOnce(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.main.once[key] = (callback: (params: typeof ipcChannelSchema.param, e) => void) => {
			const listeners = this.registeredListeners.main;
			if (listeners[ipcChannelSchema.msg] != null) {
				throw new Error("Cannot register multiple listeners on a single message");
			}
			listeners[ipcChannelSchema.msg] = (e, params) => callback(params, e);
			ipcMain.once(ipcChannelSchema.msg, listeners[ipcChannelSchema.msg]);
		};
	}

	registerMainRemove(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.main.remove[key] = () => {
			const listeners = this.registeredListeners.main;
			if (listeners[ipcChannelSchema.msg] == null) {
				throw new Error("Cannot remove listener because it does not exist");
			}
			ipcMain.removeListener(ipcChannelSchema.msg, listeners[ipcChannelSchema.msg]);
			listeners[ipcChannelSchema.msg] = null;
		};
	}

	registerMainRemoveAll(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.main.removeAll[key] = () => {
			ipcMain.removeAllListeners(ipcChannelSchema.msg);
		};
	}

	// ###############################################################################################################
	registerRendToMain(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.registerRendSend(key, ipcChannelSchema);
		this.registerMainOn(key, ipcChannelSchema);
		this.registerMainOnce(key, ipcChannelSchema);
		this.registerMainRemove(key, ipcChannelSchema);
		this.registerMainRemoveAll(key, ipcChannelSchema);
	}

	registerRendSend(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.rend.send[key] = (params: typeof ipcChannelSchema.param) => {
			ipcRenderer.send(ipcChannelSchema.msg, params);
		};
	}

	registerRendOn(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.rend.on[key] = (callback: (params: typeof ipcChannelSchema.param, e) => void) => {
			const listeners = this.registeredListeners.rend;
			if (listeners[ipcChannelSchema.msg] != null) {
				throw new Error("Cannot register multiple listeners on a single message");
			}
			listeners[ipcChannelSchema.msg] = (e, params) => callback(params, e);
			ipcRenderer.on(ipcChannelSchema.msg, listeners[ipcChannelSchema.msg]);
		};
	}

	registerRendOnce(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.rend.once[key] = (callback: (params: typeof ipcChannelSchema.param, e) => void) => {
			const listeners = this.registeredListeners.rend;
			if (listeners[ipcChannelSchema.msg] != null) {
				throw new Error("Cannot register multiple listeners on a single message");
			}
			listeners[ipcChannelSchema.msg] = (e, params) => callback(params, e);
			ipcRenderer.once(ipcChannelSchema.msg, listeners[ipcChannelSchema.msg]);
		};
	}

	registerRendRemove(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.rend.remove[key] = () => {
			const listeners = this.registeredListeners.rend;
			if (listeners[ipcChannelSchema.msg] == null) {
				throw new Error("Cannot remove listener because it does not exist");
			}
			ipcRenderer.removeListener(ipcChannelSchema.msg, listeners[ipcChannelSchema.msg]);
			listeners[ipcChannelSchema.msg] = null;
		};
	}

	registerRendRemoveAll(key: TChannelKey, ipcChannelSchema: TIpcChannelSchema): void {
		this.interface.rend.removeAll[key] = () => {
			ipcRenderer.removeAllListeners(ipcChannelSchema.msg);
		};
	}
}

/**
 * ipc channel configuration object type
 */
type TIpcChannelConfig = {
	//channel name used in the underlying ipc call ipcRenderer.on(msg,()=>{...})
	msg: string;
};

/**
 * this function is used for declaration of one specific ipc channel in ipc schema
 * input information consists of two parts:
 * 		1) type declaration
 * 			- TIpcChannelParam - type of parameter (payload) passed via channel
 * 		2) channel configuration
 * 			- config: TIpcChannelConfig
 */
export function createIpcChannel<TIpcChannelParam extends void | any>(config: TIpcChannelConfig) {
	return {
		msg: config.msg,
		param: (null as any) as TIpcChannelParam
	};
}

/**
 *
 */
type TIpcChannelSchema = ReturnType<typeof createIpcChannel>;

export type TIpcSchema = {
	main: {[ipcChannelKey: string]: TIpcChannelSchema};
	rend: {[ipcChannelKey: string]: TIpcChannelSchema};
	both: {[ipcChannelKey: string]: TIpcChannelSchema};
};

export function createTypesafeIpc<T extends TIpcSchema>(ipcSchema: T): TIpcOutput<T> {
	const ipcUtil = new IpcUtil<T>(ipcSchema);
	return ipcUtil.interface;
}
