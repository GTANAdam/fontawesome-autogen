const path = require("path");
const fs = require("fs");

const src = path.resolve(__dirname, '../../..', 'src');
const node_modules = path.resolve(__dirname, '../..');

const iconTypes = [
    {prefix: "fas", libary: "solid", type: ""},
    {prefix: "far", libary: "regular", type: ""},
    {prefix: "fal", libary: "light", type: ""},
    {prefix: "fab", libary: "brands", type: ""},
    {prefix: "fad", libary: "duotone", type: ""},
    {prefix: "fat", libary: "thin", type: ""},
];

const faModule = "@fortawesome";
const outputFolder = `${src}/plugins`;
const outputFile = `${outputFolder}/fontawesome-autogen.js`;

// Edit this per requirements
const matches = [
    /(?<=icon:\s"+)fa.*?(?=",)/g, // Get icons within props or data
    /(?<=default:\s"+)fa.*?(?=",)/g, // Get default icon values within props
    /(?<=<fa\sicon="+).*?(?=")/g // Get icons within components
];

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

String.prototype.removeAt = function removeAt(index) {
    return this.slice(0, index) + this.slice(index + 1);
}

function getLibraries() {
    const libs = { 'pro': [], 'free': []};
    const pathing = `${node_modules}${path.sep}${faModule}` 

    // Get all installed libraries
    for (const name of fs.readdirSync(pathing)) {
        if (!fs.lstatSync(`${pathing}${path.sep}${name}`).isDirectory()) continue;

        const lib = name.match(/(?=pro-|free-).*?(?=-svg-icons)/g);
        if (lib === null) continue;

        const libSpl = lib[0].split('-');
        libs[libSpl[0]].push(libSpl[1]);
    }

    // Take only pro libraries instead of free ones
    const filtered = [];
    for (const [key, value] of Object.entries(libs)) {
        for (const val of value) {
            if (!filtered.map((e) => e.split('-')[1]).includes(val)) {
                filtered.push(`${key}-${val}`);
            }
        }
    }

    // Populate them into our libs object
    // the reason this is in its own loop is because the prior loop will fill the array out of order, it doesn't matter much anyway
    for (const l of filtered) {
        const spl = l.split('-');
        const index = iconTypes.indexOf(iconTypes.find(e => e.libary === spl[1]));
        iconTypes[index].type = spl[0];
    }
}

var files = [];
function getFiles(path) { // Recursive ((!))
    for (const name of fs.readdirSync(path)) {
        const entry = `${path}/${name}`;

        fs.lstatSync(entry).isDirectory()
            ? getFiles(entry) 
            : files.push(entry);
    }

    // Filter all non-vue files
    files = files.filter(file => file.indexOf(".vue") > -1);
}

function getIcons(files) {
    const icons = [];
    for (const file of files) {
        for (const r of matches) {
            const icon = fs.readFileSync(file).toString().match(r);
            if (icon === null) continue;

            for (const i of icon) {
                icons.push(i);
            }
        }
    }

    // Distinct values (Remove duplicates)
    return [...new Set(icons)]; 
}

function sortIcons(icons) {
    const ficons = []
    for (const icon of icons) {
        const spl = icon.split('-');

        // fa(r|s|l|b|d)
        const prefix = spl[0];

        // thumbs-up -> fathumbs-up
        let iconName = `fa${spl.slice(1).join('-')}`;

        // fathumbs-up -> faThumbs-up
        iconName = iconName.replaceAt(2, iconName[2].toUpperCase());

        // faThumbs-up
        while (true) {
            let pos = iconName.indexOf('-');
            if (pos === -1) break;

            // faThumbs-up -> faThumbs-Up -> faThumbsUp
            iconName = (iconName.replaceAt(pos + 1, iconName[pos + 1].toUpperCase()).removeAt(pos));
        }

        ficons.push({prefix: prefix, icon: iconName});
    }

    return ficons;
}

function getListing(sortedIcons) {
    let result = `// Auto generated @ ${new Date()}`;
    
    // Filter out icons from not installed libraries
    sortedIcons = sortedIcons.filter(el => iconTypes.find(e => e.prefix === el.prefix).type !== "");

    for (const type of iconTypes) {
        if (sortedIcons.filter(el => el.prefix === type.prefix).length === 0) continue; // ignore unused libraries
        result += `\n\n//${type.prefix}\nimport {\n${sortedIcons.filter(el => el.prefix === type.prefix).map((e) => `\t${e.icon} as ${e.prefix}${e.icon.slice(2)}`).join(",\n")}\n} from '${faModule}/${type.type}-${type.libary}-svg-icons';`;
    }

    return result +=`\n\nimport { library } from "@fortawesome/fontawesome-svg-core";\nlibrary.add(\n${sortedIcons.map((e) => `\t${e.prefix}${e.icon.slice(2)}`).join(",\n")}\n);`;
}

const t0 = Date.now();

// Fetch installed libraries and only prioritize pro versions if even free ones are installed
getLibraries()

// Find all vue files within folders
getFiles(src);

// parse icons within found files
const icons = getIcons(files);

// Fix up icon list
const sortedIcons = sortIcons(icons);

// Generate code
const listing = getListing(sortedIcons);

const t1 = Date.now();

// Write to file
fs.mkdir(outputFolder, { recursive: true }, (err) => {
    if (err) throw err;
    
    fs.writeFile(outputFile, listing, function (err) {
        if (err) return console.log(err);
        console.log(`- Fontawesome treeshaking list generated. (took ${(t1 - t0)} ms)`);
      });
});
