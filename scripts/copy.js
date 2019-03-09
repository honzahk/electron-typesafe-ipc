const fs = require("fs");
const path = require("path");

const PATH_PROJECT_ROOT = path.resolve(__dirname, "..");
const PATH_DIST_ROOT = path.resolve(PATH_PROJECT_ROOT, "dist");

main();

function main() {
	create_dist_package_json();
	fs.copyFileSync(path.resolve(PATH_PROJECT_ROOT, "README.md"), path.resolve(PATH_DIST_ROOT, "README.md"));
}

function create_dist_package_json() {
	//load contents of original package.json
	const package_json_orig = require("../package.json");

	//specify fields to be copied into dist package.json
	const {...keysToCopyIntoDist} = package_json_orig;

	//write dist package.json
	const package_json_dist = JSON.stringify(keysToCopyIntoDist, null, 4);
	fs.writeFileSync(path.resolve(PATH_DIST_ROOT, "package.json"), package_json_dist);
}
