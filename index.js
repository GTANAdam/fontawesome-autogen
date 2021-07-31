const path = require("path");
const fs = require("fs");

const src = path.resolve(__dirname, "../../..", "src");
const node_modules = path.resolve(__dirname, "../..");

// const src = "./example/src";
// const node_modules = "./example/node_modules";

const iconTypes = [
  { prefix: "fas", libary: "solid", type: "" },
  { prefix: "far", libary: "regular", type: "" },
  { prefix: "fal", libary: "light", type: "" },
  { prefix: "fab", libary: "brands", type: "" },
  { prefix: "fad", libary: "duotone", type: "" },
  { prefix: "fat", libary: "thin", type: "" },
];

const prefixes = /fas|far|fal|fab|fad|fat/;

const faModule = "@fortawesome";
const outputFolder = `${src}/plugins`;
const outputFile = `${outputFolder}/fontawesome-autogen.js`;

const componentCheck =
  /[Vue\.component\("]([a-z0-9-]+)["],[ ]{0,1}FontAwesomeIcon\)/g;
const componentName = getComponentName();
// console.log(componentName);

// Edit this per requirements
const matches = [
  /(?<=icon:\s"+)fa.*?(?=",)/g, // Get icons within props or data
  /(?<=default:\s"+)fa.*?(?=",)/g, // Get default icon values within props
  ///(?<=<fa\s+icon="+).*?(?=")/g // Get icons within components
  //   /icon=['"]([a-z-]+)['"]|:icon=\"\[['"](fa[a-z])['"],.*['"]([a-z-]+)['"]\]/g,
  new RegExp(
    `<(?:fa|${componentName})\\s+icon=['"]([a-z-]+)['"]|<${componentName}\\s+:icon=\"\[['"](fa[a-z])['"],.*['"]([a-z-]+)['"]\]`,
    "g"
  ),
];

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  );
};

String.prototype.removeAt = function removeAt(index) {
  return this.slice(0, index) + this.slice(index + 1);
};

function getLibraries() {
  const libs = { pro: [], free: [] };
  const pathing = `${node_modules}${path.sep}${faModule}`;

  // Get all installed libraries
  for (const name of fs.readdirSync(pathing)) {
    if (!fs.lstatSync(`${pathing}${path.sep}${name}`).isDirectory()) continue;

    const lib = name.match(/(?=pro-|free-).*?(?=-svg-icons)/g);
    if (lib === null) continue;

    const libSpl = lib[0].split("-");
    libs[libSpl[0]].push(libSpl[1]);
  }

  // Take only pro libraries instead of free ones
  const filtered = [];
  for (const [key, value] of Object.entries(libs)) {
    for (const val of value) {
      if (!filtered.map((e) => e.split("-")[1]).includes(val)) {
        filtered.push(`${key}-${val}`);
      }
    }
  }

  // Populate them into our libs object
  // the reason this is in its own loop is because the prior loop will fill the array out of order, it doesn't matter much anyway
  for (const l of filtered) {
    const spl = l.split("-");
    const index = iconTypes.indexOf(iconTypes.find((e) => e.libary === spl[1]));
    iconTypes[index].type = spl[0];
  }
}

var files = [];
function getFiles(path) {
  // Recursive ((!))
  for (const name of fs.readdirSync(path)) {
    const entry = `${path}/${name}`;

    fs.lstatSync(entry).isDirectory() ? getFiles(entry) : files.push(entry);
  }

  // Filter all non-vue files
  files = files.filter(
    (file) => file.indexOf(".vue") > -1 || file.indexOf(".js") > -1
  );
}

function getComponentName() {
  var files = [];
  getfiles(src);
  function getfiles(path) {
    // Recursive ((!))
    for (const name of fs.readdirSync(path)) {
      const entry = `${path}/${name}`;

      fs.lstatSync(entry).isDirectory() ? getfiles(entry) : files.push(entry);
    }

    // Filter all non-vue files
    files = files.filter((file) => file.indexOf(".js") > -1);
  }

  for (const f of files) {
    const file = fs.readFileSync(f);
    const compo = componentCheck.exec(file);
    if (compo === null) return "font-awesome-icon";
    return compo[1];
  }
}

function getIcons(files) {
  const icons = [];
  for (const f of files) {
    const file = fs.readFileSync(f);

    for (const r of matches) {
      //console.log(r);

      while (null != (icon = r.exec(file))) {
        icon = icon.filter((e) => e != null);
        icon.shift();

        if (!prefixes.test(icon)) {
          icon = "fas-" + icon;
        } else if (icon.length == 1) {
          icon = icon[0];
        } else if (icon.length == 2) {
          icon = icon[0] + "-" + icon[1];
        }

        icons.push(icon);
      }
    }
  }

  // Distinct values (Remove duplicates)
  return [...new Set(icons)];
}

function sortIcons(icons) {
  const ficons = [];
  for (const icon of icons) {
    const spl = icon.split("-");

    // fa(r|s|l|b|d)
    const prefix = spl[0];

    // thumbs-up -> fathumbs-up
    let iconName = `fa${spl.slice(1).join("-")}`;

    // fathumbs-up -> faThumbs-up
    iconName = iconName.replaceAt(2, iconName[2].toUpperCase());

    // faThumbs-up
    while (true) {
      let pos = iconName.indexOf("-");
      if (pos === -1) break;

      // faThumbs-up -> faThumbs-Up -> faThumbsUp
      iconName = iconName
        .replaceAt(pos + 1, iconName[pos + 1].toUpperCase())
        .removeAt(pos);
    }

    ficons.push({ prefix: prefix, icon: iconName });
  }

  return ficons;
}

function getListing(sortedIcons) {
  let result = `// Auto generated @ ${new Date()}`;

  // Filter out icons from not installed libraries
  sortedIcons = sortedIcons.filter(
    (el) => iconTypes.find((e) => e.prefix === el.prefix).type !== ""
  );

  for (const type of iconTypes) {
    if (sortedIcons.filter((el) => el.prefix === type.prefix).length === 0)
      continue; // ignore unused libraries
    result += `\n\n//${type.prefix}\nimport {\n${sortedIcons
      .filter((el) => el.prefix === type.prefix)
      .map((e) => `\t${e.icon} as ${e.prefix}${e.icon.slice(2)}`)
      .join(",\n")}\n} from '${faModule}/${type.type}-${
      type.libary
    }-svg-icons';`;
  }

  return (result += `\n\nimport { library } from "@fortawesome/fontawesome-svg-core";\nlibrary.add(\n${sortedIcons
    .map((e) => `\t${e.prefix}${e.icon.slice(2)}`)
    .join(",\n")}\n);`);
}

const t0 = Date.now();

// Fetch installed libraries and only prioritize pro versions if even free ones are installed
getLibraries();

// Find all vue files within folders
getFiles(src);
// console.log(files);

// parse icons within found files
const icons = getIcons(files);
// console.log(icons);

// Fix up icon list
const sortedIcons = sortIcons(icons);

// Generate code
const listing = getListing(sortedIcons);

const previousListing = [
  ...new Set(
    [
      ...(fs.existsSync(outputFile) && fs.readFileSync(outputFile))
        .toString()
        .matchAll(/fa[a-z][A-Z]\w+/g),
    ].map(([icon]) => icon)
  ),
].sort();

const currentListing = [
  ...new Set(
    [...listing.toString().matchAll(/fa[a-z][A-Z]\w+/g)].map(([icon]) => icon)
  ),
].sort();

if (JSON.stringify(previousListing) === JSON.stringify(currentListing)) {
  console.log(
    `- Fontawesome treeshaking list already up-to-date. (took ${
      Date.now() - t0
    } ms)`
  );
  return;
}

// Write to file
fs.mkdir(outputFolder, { recursive: true }, (err) => {
  if (err) throw err;

  fs.writeFile(outputFile, listing, function (err) {
    if (err) return console.log(err);
    console.log(
      `- Fontawesome treeshaking list generated. (took ${Date.now() - t0} ms)`
    );
  });
});
