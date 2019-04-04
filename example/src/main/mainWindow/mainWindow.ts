import {BrowserWindow} from "electron";
import * as path from "path";
import {format as formatUrl} from "url";

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
export let mainWindow: BrowserWindow | null;

export function createMainWindow() {
	if (mainWindow != null) {
		return;
	}

	mainWindow = new BrowserWindow();
	if (isDevelopment) {
		mainWindow.webContents.openDevTools();
	}

	if (isDevelopment) {
		mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
	} else {
		mainWindow.loadURL(
			formatUrl({
				pathname: path.join(__dirname, "index.html"),
				protocol: "file",
				slashes: true
			})
		);
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	mainWindow.webContents.on("devtools-opened", () => {
		mainWindow.focus();
		setImmediate(() => {
			mainWindow.focus();
		});
	});

	return mainWindow;
}
