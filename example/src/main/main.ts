import {app} from "electron";
import {createMainWindow} from "./mainWindow/mainWindow";
import {createTray} from "./tray/tray";

// quit application when all windows are closed
app.on("window-all-closed", () => {
	// on macOS it is common for applications to stay open until the user explicitly quits
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// on macOS it is common to re-create a window even after all windows have been closed
	createMainWindow();
});

app.on("ready", () => {
	createTray();
	createMainWindow();
});
