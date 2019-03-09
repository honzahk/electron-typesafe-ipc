import {ipcRenderer, ipcMain, BrowserWindow} from "electron";

type TIpcMainSendFunction<TIpcParam> = (win: BrowserWindow, params: TIpcParam) => void;
type TIpcRendererSendFunction<TIpcParam> = (params: TIpcParam) => void;
type TIpcOnFunction<TIpcParam> = (callback: (params: TIpcParam, e) => void) => void;
type TIpcOnceFunction<TIpcParam> = TIpcOnFunction<TIpcParam>; //typeof once == typeof on
type TIpcRemoveFunction = () => void;

type TIPcListRegistered<TIpcListParams extends {main: any; renderer: any}> = {
	main: {
		send: {[K in keyof TIpcListParams["main"]]: TIpcMainSendFunction<TIpcListParams["main"][K]>};
		on: {[K in keyof TIpcListParams["renderer"]]: TIpcOnFunction<TIpcListParams["renderer"][K]>};
		once: {[K in keyof TIpcListParams["renderer"]]: TIpcOnceFunction<TIpcListParams["renderer"][K]>};
		remove: {[K in keyof TIpcListParams["renderer"]]: TIpcRemoveFunction};
	};
	rend: {
		send: {[K in keyof TIpcListParams["renderer"]]: TIpcRendererSendFunction<TIpcListParams["renderer"][K]>};
		on: {[K in keyof TIpcListParams["main"]]: TIpcOnFunction<TIpcListParams["main"][K]>};
		once: {[K in keyof TIpcListParams["main"]]: TIpcOnceFunction<TIpcListParams["main"][K]>};
		remove: {[K in keyof TIpcListParams["main"]]: TIpcRemoveFunction};
	};
};

class IpcUtil<TIpcListParams extends {main: any; renderer: any}> {
	public registeredListeners = {
		main: {},
		rend: {}
	};

	public interface: TIPcListRegistered<TIpcListParams> = {
		main: {send: {}, on: {}, once: {}, remove: {}},
		rend: {send: {}, on: {}, once: {}, remove: {}}
	} as any;

	// ###############################################################################################################
	registerMainToRend<TIpcParam>(key: string, msg: string): void {
		this.registerMainSend(key, msg);
		this.registerRendOn(key, msg);
		this.registerRendOnce(key, msg);
		this.registerRendRemove(key, msg);
	}

	registerMainSend<TIpcParam>(key: string, msg: string): void {
		this.interface.main.send[key] = (win: BrowserWindow, params: TIpcParam) => {
			win.webContents.send(msg, params);
		};
	}

	registerMainOn<TIpcParam>(key: string, msg: string): void {
		this.interface.main.on[key] = (callback: (params: TIpcParam, e) => void) => {
			const listeners = this.registeredListeners.main;
			if (listeners[msg] != null) {
				throw new Error("Cannot register multiple listeners on a single message");
			}
			listeners[msg] = (e, params) => callback(params, e);
			ipcMain.on(msg, listeners[msg]);
		};
	}

	registerMainOnce<TIpcParam>(key: string, msg: string): void {
		this.interface.main.once[key] = (callback: (params: TIpcParam, e) => void) => {
			const listeners = this.registeredListeners.main;
			if (listeners[msg] != null) {
				throw new Error("Cannot register multiple listeners on a single message");
			}
			listeners[msg] = (e, params) => callback(params, e);
			ipcMain.once(msg, listeners[msg]);
		};
	}

	registerMainRemove(key: string, msg: string): void {
		this.interface.main.remove[key] = () => {
			const listeners = this.registeredListeners.main;
			if (listeners[msg] == null) {
				throw new Error("Cannot remove listener because it does not exist");
			}
			ipcMain.removeListener(msg, listeners[msg]);
			listeners[msg] = null;
		};
	}

	// ###############################################################################################################
	registerRendToMain<TIpcParam>(key: string, msg: string): void {
		this.registerRendSend(key, msg);
		this.registerMainOn(key, msg);
		this.registerMainOnce(key, msg);
		this.registerMainRemove(key, msg);
	}

	registerRendSend<TIpcParam>(key: string, msg: string): void {
		this.interface.rend.send[key] = (params: TIpcParam) => {
			ipcRenderer.send(msg, params);
		};
	}

	registerRendOn<TIpcParam>(key: string, msg: string): void {
		this.interface.rend.on[key] = (callback: (params: TIpcParam, e) => void) => {
			const listeners = this.registeredListeners.rend;
			if (listeners[msg] != null) {
				throw new Error("Cannot register multiple listeners on a single message");
			}
			listeners[msg] = (e, params) => callback(params, e);
			ipcRenderer.on(msg, listeners[msg]);
		};
	}

	registerRendOnce<TIpcParam>(key: string, msg: string): void {
		this.interface.rend.once[key] = (callback: (params: TIpcParam, e) => void) => {
			const listeners = this.registeredListeners.rend;
			if (listeners[msg] != null) {
				throw new Error("Cannot register multiple listeners on a single message");
			}
			listeners[msg] = (e, params) => callback(params, e);
			ipcRenderer.once(msg, listeners[msg]);
		};
	}

	registerRendRemove(key: string, msg: string): void {
		this.interface.rend.remove[key] = () => {
			const listeners = this.registeredListeners.rend;
			if (listeners[msg] == null) {
				throw new Error("Cannot remove listener because it does not exist");
			}
			ipcRenderer.removeListener(msg, listeners[msg]);
			listeners[msg] = null;
		};
	}

	// ###############################################################################################################
	constructor(ipcList: {main: {[K in keyof TIpcListParams["main"]]: string}; renderer: {[K in keyof TIpcListParams["renderer"]]: string}}) {
		for (let key in ipcList["main"]) {
			this.registerMainToRend(key, ipcList["main"][key]);
		}

		for (let key in ipcList["renderer"]) {
			this.registerRendToMain(key, ipcList["renderer"][key]);
		}
	}
}

function registerMany<TIpcListParams extends {main: any; renderer: any}>(ipcList: {
	main: {[K in keyof TIpcListParams["main"]]: string};
	renderer: {[K in keyof TIpcListParams["renderer"]]: string};
}): TIPcListRegistered<TIpcListParams> {
	const ipcUtil = new IpcUtil(ipcList);
	return ipcUtil.interface;
}

export const libipc = {
	registerMany
};
