import {Tray, nativeImage, Menu} from "electron";
import path from "path";
import {helpers} from "../../shared/helpers";
import {tsipc} from "../../shared/tsipc";
import {mainWindow} from "../mainWindow/mainWindow";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
export let tray: Tray | null;

export function createTray() {
	if (tray != null) {
		return;
	}

	const iconPath = path.join(__dirname, "../../../images/icons/icon-tray.png");

	const trayIcon = nativeImage.createFromPath(iconPath).resize({width: 16, height: 16});
	tray = new Tray(trayIcon);

	//on first render, display no items
	renderTrayContextMenu();
}

function renderTrayContextMenu() {
	tray.setContextMenu(
		Menu.buildFromTemplate([
			{label: "electron-typesafe-ipc", enabled: false},
			{type: "separator"},
			{label: "items:", enabled: false},
			...itemIds.map((itemId) => ({
				label: `[remove] item-${itemId}`,
				click: () => {
					itemIds = itemIds.filter((id) => id != itemId);
					renderTrayContextMenu();
					tsipc.main.send.mainItemClickRemove(mainWindow, {itemId: itemId});
				}
			})),
			{
				label: "add item!",
				click: () => {
					const itemId = helpers.rand();
					itemIds.push(itemId);
					renderTrayContextMenu();
					tsipc.main.send.mainItemClickAdd(mainWindow, {itemId: itemId});
				}
			}
		])
	);
}

//state of context menu items
let itemIds = [];
