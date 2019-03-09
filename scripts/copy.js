const fs = require("fs");
const path = require("path");

const PATH_PROJECT_ROOT = path.resolve(__dirname, "..");
const PATH_DIST_ROOT = path.resolve(PATH_PROJECT_ROOT, "dist");

main();

function main() {
	create_dist_package_json();
}

function create_dist_package_json() {
	//nacteme obsah origo package.json
	const package_json_orig = require("../package.json");

	//specifikuje fields, ktere chceme prekopirovat do dist verze
	const fields = ["name", "version", "description", "main", "keywords", "author", "license", "dependencies", "devDependencies"];

	const package_json_dist_obj = {};
	//atributy chceme zkopirovat v poradi, jake je v originale
	Object.keys(package_json_orig).forEach((key) => {
		if (fields.includes(key)) {
			package_json_dist_obj[key] = package_json_orig[key];
		}
	});

	const package_json_dst = JSON.stringify(package_json_dist_obj, null, 4);
	fs.writeFileSync(path.resolve(PATH_DIST_ROOT, "package.json"), package_json_dst);
}
