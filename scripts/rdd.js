/*
    rdd - https://github.com/latte-soft/rdd

    Copyright (C) 2023 Latte Softworks <latte.to>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const basePath = window.location.href.split("?")[0];
const usageMsg = `[*] USAGE: ${basePath}?channel=<CHANNEL_NAME>&binaryType=<BINARY_TYPE>
    OR:
[*] USAGE: ${basePath}?channel=<CHANNEL_NAME>&binaryType=<BINARY_TYPE>&version=<VERSION_HASH>

    Binary Types:
    * WindowsPlayer
    * WindowsStudio64
    * MacPlayer
    * MacStudio
    
    Extra Notes:
    * If \`channel\` isn't provided, it will default to "LIVE" (psuedo identifier for
      the production channel)
    * You can provide \`binaryType\` to fetch the *latest* deployment on a channel, or
      BOTH \`binaryType\` and \`version\` to fetch a specific deployment of a specific
      binary type; for a specific \`version\`, you NEED to provide \`binaryType\` aswell

    You can also use an extra flag we provide, \`blobDir\`, for specifying where RDD
    should fetch deployment files/binaries from. This is ONLY useful for using
    different relative paths than normal, such as "/mac/arm64" which is specifically
    present on certain channels

    Blob Directories (Examples):
    * "/" (Default for WindowsPlayer/WindowsStudio64)
    * "/mac/" (Default for MacPlayer/MacStudio)
    * "/mac/arm64/"
    ..
`;

// Root extract locations for different known zips possible in the Win manifests
const extractRootsDict = {
    player: {
        "RobloxApp.zip": "",
        "shaders.zip": "shaders/",
        "ssl.zip": "ssl/",

        "WebView2.zip": "",
        "WebView2RuntimeInstaller.zip": "WebView2RuntimeInstaller/",

        "content-avatar.zip": "content/avatar/",
        "content-configs.zip": "content/configs/",
        "content-fonts.zip": "content/fonts/",
        "content-sky.zip": "content/sky/",
        "content-sounds.zip": "content/sounds/",
        "content-textures2.zip": "content/textures/",
        "content-models.zip": "content/models/",

        "content-textures3.zip": "PlatformContent/pc/textures/",
        "content-terrain.zip": "PlatformContent/pc/terrain/",
        "content-platform-fonts.zip": "PlatformContent/pc/fonts/",

        "extracontent-luapackages.zip": "ExtraContent/LuaPackages/",
        "extracontent-translations.zip": "ExtraContent/translations/",
        "extracontent-models.zip": "ExtraContent/models/",
        "extracontent-textures.zip": "ExtraContent/textures/",
        "extracontent-places.zip": "ExtraContent/places/"
    },

    studio: {
        "RobloxStudio.zip": "",
        "redist.zip": "",
        "Libraries.zip": "",
        "LibrariesQt5.zip": "",

        "WebView2.zip": "",
        "WebView2RuntimeInstaller.zip": "",

        "shaders.zip": "shaders/",
        "ssl.zip": "ssl/",

        "Qml.zip": "Qml/",
        "Plugins.zip": "Plugins/",
        "StudioFonts.zip": "StudioFonts/",
        "BuiltInPlugins.zip": "BuiltInPlugins/",
        "ApplicationConfig.zip": "ApplicationConfig/",
        "BuiltInStandalonePlugins.zip": "BuiltInStandalonePlugins/",

        "content-qt_translations.zip": "content/qt_translations/",
        "content-sky.zip": "content/sky/",
        "content-fonts.zip": "content/fonts/",
        "content-avatar.zip": "content/avatar/",
        "content-models.zip": "content/models/",
        "content-sounds.zip": "content/sounds/",
        "content-configs.zip": "content/configs/",
        "content-api-docs.zip": "content/api_docs/",
        "content-textures2.zip": "content/textures/",
        "content-studio_svg_textures.zip": "content/studio_svg_textures/",

        "content-platform-fonts.zip": "PlatformContent/pc/fonts/",
        "content-terrain.zip": "PlatformContent/pc/terrain/",
        "content-textures3.zip": "PlatformContent/pc/textures/",

        "extracontent-translations.zip": "ExtraContent/translations/",
        "extracontent-luapackages.zip": "ExtraContent/LuaPackages/",
        "extracontent-textures.zip": "ExtraContent/textures/",
        "extracontent-scripts.zip": "ExtraContent/scripts/",
        "extracontent-models.zip": "ExtraContent/models/"
    }
};

// Yes, these files on S3 are meant for "legacy bootstrappers", but they work great
// for purposes like this, and tracking. We also *can't* use clientsettings, due to
// CORS policies of course..
const binaryTypes = {
    WindowsPlayer: {
        versionFile: "/version",
        blobDir: "/"
    },
    WindowsStudio64: {
        versionFile: "/versionQTStudio",
        blobDir: "/"
    },
    MacPlayer: {
        versionFile: "/mac/version",
        blobDir: "/mac"
    },
    MacStudio: {
        versionFile: "/mac/versionStudio",
        blobDir: "/mac"
    },
}

const urlParams = new URLSearchParams(window.location.search);

const consoleText = document.getElementById("consoleText");
const downloadForm = document.getElementById("downloadForm");
const downloadFormDiv = document.getElementById("downloadFormDiv");

function getFormInfo() {
    const channelName = downloadForm.channel.value.trim() || downloadForm.channel.placeholder;
    let queryString = `?channel=${encodeURIComponent(channelName)}&binaryType=${encodeURIComponent(downloadForm.binaryType.value)}`;

    const versionHash = downloadForm.version.value.trim();
    if (versionHash != "") {
        queryString += `&version=${encodeURIComponent(versionHash)}`;
    }

    return basePath + queryString;
};

// Called upon the "Download" form button
function downloadFromFormInfo() {
    window.open(getFormInfo(), "_blank");
};

// Called upon the "Copy Permanent Link" form button
function copyFormInfo() {
    navigator.clipboard.writeText(getFormInfo());
};

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

function log(msg, end = "\n", autoScroll = true) {
    consoleText.append(msg + end);
    if (autoScroll) {
        scrollToBottom();
    }
};

// Prompt download
function downloadBinaryFile(fileName, data) {
    const blob = new Blob([data], {type: "application/zip"});

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    let button = document.createElement("button");
    button.innerText = `Redownload ${fileName}`;

    button.onclick = function() {
        link.click();
    };

    document.body.appendChild(button);
    scrollToBottom();

    button.click();
};

// Soley for the manifest etc
function request(url, callback, errorOnNotOk = true) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", url, true);

    // When the request is done later..
    httpRequest.onload = function() {
        // Handle req issues, and don't call-back
        const statusCode = httpRequest.status
        if (errorOnNotOk && (statusCode < 200 || statusCode >= 400)) {
            log(`[!] Request error (${statusCode}) @ ${url} - ${httpRequest.responseText}`);
            return;
        }

        callback(httpRequest.responseText, statusCode);
    };

    httpRequest.onerror = function(e) {
        log(`[!] Request error @ ${url} - ${e}`);
    };

    httpRequest.send();
};

function requestBinary(url, callback) {
    const httpRequest = new XMLHttpRequest();

    httpRequest.open("GET", url, true);
    httpRequest.responseType = "arraybuffer";

    // When the request is done later..
    httpRequest.onload = function() {
        // Handle req issues, and don't call-back
        const statusCode = httpRequest.status
        if (statusCode != 200) {
            log(`[!] Binary request error (${statusCode}) @ ${url}`);
            return;
        }

        const arrayBuffer = httpRequest.response;
        if (! arrayBuffer) {
            log(`[!] Binary request error (${statusCode}) @ ${url} - Failed to get binary ArrayBuffer from response`);
            return;
        }

        callback(arrayBuffer, statusCode);
    };

    httpRequest.onerror = function(e) {
        log(`[!] Binary request error @ ${url} - ${e}`);
    };

    httpRequest.send();
};

function getQuery(queryString) {
    if (! urlParams.has(queryString)) {
        return null;
    }

    return urlParams.get(queryString) || null;
};

let hostPath = getQuery("_hostPath");
let channel = getQuery("channel");
let version = getQuery("version");
let binaryType = getQuery("binaryType");
let blobDir = getQuery("blobDir");

let channelPath;
let versionPath;

let extractRoots;
let zip;

// Init
main();

function main() {
    if (window.location.search == "") {
        // We won't log anything else; just exit
        downloadFormDiv.hidden = false;
        log(usageMsg, "\n", false);
        return;
    }

    // "Internal"
    if (hostPath) {
        // If there's a "/" at the end, remove it
        if (hostPath.slice(-1) == "/") {
            hostPath = hostPath.slice(0, -1);
        }
    } else {
        hostPath = "https://roblox-setup.cachefly.net"; // setup.rbxcdn.com doesn't have the proper CORS cfg
    }

    // Optional
    if (channel) {
        if (channel != "LIVE") {
            channel = channel.toLowerCase();
        }
    } else {
        channel = "LIVE";
    }

    if (channel == "LIVE") {
        channelPath = `${hostPath}`;
    } else {
        channelPath = `${hostPath}/channel/${channel}`;
    }

    // We're also checking to make sure blobDir hasn't been included too for the compatibility warning later
    if (version && ! binaryType && ! blobDir) {
        log("[!] Error: If you provide a specific `version`, you need to set the `binaryType` aswell! See the usage doc below for examples of various `binaryType` inputs:", "\n\n",);
        log(usageMsg, "\n", false);
        return;
    }

    if (blobDir) {
        if (blobDir.slice(-1) != "/") {
            blobDir += "/"
        }
        if (blobDir.slice(0) != "/") {
            blobDir = "/" + blobDir;
        }

        // We used to support usage of ONLY `blobDir` & `version` in the past, requiring us
        // to essentially "guess" the desired binaryType ourselves! (how fun, right!?)
        if (! binaryType) {
            log(`[!] Error: Using the \`blobDir\` query without defining \`binaryType\` has been
    deprecated, and can no longer be used in requests. If you were using \`blobDir\`
    explicitly for MacPlayer/MacStudio with "blobDir=mac" or "/mac", please replace
    blobDir with a \`binaryType\` of either MacPlayer or MacStudio respectively`, "\n\n");

            log(usageMsg, "\n", false);
            return;
        }
    }

    // At this point, we expect `binaryType` to be defined if all is well on input from the user..
    if (! binaryType) {
        // Again, we used to support specific-versions without denoting binaryType explicitly
        log("[!] Error: Missing required \`binaryType\` query, are you using an old perm link for a specific version?", "\n\n");
        log(usageMsg, "\n", false);
        return;
    }

    let versionFilePath; // Only used if `version` isn't already defined (later, see code below the if-else after this)
    if (binaryType in binaryTypes) {
        const binaryTypeObject = binaryTypes[binaryType];
        versionFilePath = channelPath + binaryTypeObject.versionFile;

        // If `blobDir` has already been defined by the user, we don't want to override it here..
        if (! blobDir) {
            blobDir = binaryTypeObject.blobDir;
        }
    } else {
        log(`[!] Error: \`binaryType\` given, "${binaryType}" not supported. See list below for supported \`binaryType\` inputs:`, "\n\n");
        log(usageMsg);
        return;
    }

    if (version) {
        // We're already good to go
        fetchManifest();
    } else {
        log(`[+] Fetching version for ${binaryType}@${channel}.. `, "");
        
        request(versionFilePath, function(versionBody) {
            log("done!");
            version = versionBody;
            fetchManifest();
        });
    }
};

function fetchManifest() {
    versionPath = `${channelPath}${blobDir}${version}-`;

    if (binaryType == "MacPlayer" || binaryType == "MacStudio") {
        const zipFileName = (binaryType == "MacPlayer" && "RobloxPlayer.zip") || (binaryType == "MacStudio" && "RobloxStudioApp.zip")
        log(`[+] Fetching zip archive for BinaryType "${binaryType}" (${zipFileName})`);

        const outputFileName = `${channel}-${binaryType}-${version}.zip`;
        log(`[+] (Please wait!) Downloading ${outputFileName}..`, "");

        requestBinary(versionPath + outputFileName, function(zipData) {
            log("done!");
            downloadBinaryFile(outputFileName, zipData);
        });
    } else {
        // Now, we're only dealing with Windows bin logic
        log(`[+] Fetching rbxPkgManifest for ${version}@${channel}.. `, "");
        request(versionPath + "rbxPkgManifest.txt", getManifestCallback);
    }
};

async function getManifestCallback(manifestBody) {
    log("done!");
    const pkgManifestLines = manifestBody.split("\n").map(line => line.trim());

    if (pkgManifestLines[0] != "v0") {
        log(`[!] Error: rbxPkgManifest manifest version incorrect; expected "v0", got "${pkgManifestLines[0]}"`);
        return
    }

    if (binaryType == "WindowsPlayer") {
        extractRoots = extractRootsDict.player;
    } else if (binaryType == "WindowsStudio64") {
        extractRoots = extractRootsDict.studio;
    } else {
        log("[!] Error: Bad/unrecognized rbxPkgManifest, aborting..");
        return;
    }

    log(`[+] Fetching blobs for BinaryType \`${binaryType}\`..`);

    zip = new JSZip();
    
    // For both WindowsPlayer and WindowsStudio64
    zip.file("AppSettings.xml", `<?xml version="1.0" encoding="UTF-8"?>
<Settings>
	<ContentFolder>content</ContentFolder>
	<BaseUrl>http://www.roblox.com</BaseUrl>
</Settings>
`);

    let threadsLeft = 0;

    function doneCallback() {
        threadsLeft -= 1;
    };

    function getThreadsLeft() {
        return threadsLeft - 1;
    };

    for (const index in pkgManifestLines) {
        const pkgManifestLine = pkgManifestLines[index];
        if (! pkgManifestLine.includes(".")) {
            continue; // Not a file in the manifest! (yes, this is quite a lazy way to check it lol)
        }

        threadsLeft += 1;
        downloadPackage(pkgManifestLine, doneCallback, getThreadsLeft);
    }

    function checkIfNoThreadsLeft() {
        if (threadsLeft > 0) {
            setTimeout(checkIfNoThreadsLeft, 250);
            return;
        }

        // Now, we can export and download the complete zip
        const outputFileName = `${channel}-${binaryType}-${version}.zip`;
        log(`[+] Exporting assembled zip file "${outputFileName}".. `, "");

        zip.generateAsync({type: "arraybuffer"}).then(function(outputZipData) {
            zip = null;
            log("done!");
            downloadBinaryFile(outputFileName, outputZipData);
        });
    };

    checkIfNoThreadsLeft();
};

async function downloadPackage(packageName, doneCallback, getThreadsLeft) {
    log(`[+] Fetching "${packageName}"..`,);
    const blobUrl = versionPath + packageName;

    requestBinary(blobUrl, async function(blobData) {
        log(`[+] Package "${packageName}" received!`);

        if (! packageName.endsWith(".zip")) {
            // We can skip extraction logic and just add the file directly to the root
            zip.file(packageName, blobData);
            log(`[+] Moved package "${packageName}" directly to the root folder`);
            doneCallback();
            return;
        } else if (packageName in extractRoots == false) {
            log(`[*] Package name "${packageName}" not defined in extraction roots for BinaryType \`${binaryType}\`, skipping extraction! (THIS MAY MAKE THE ZIP OUTPUT INCOMPLETE, BE AWARE!)`);
            zip.file(packageName, blobData);
            log(`[+] Moved package "${packageName}" directly to the root folder`);
            doneCallback();
            return;
        }

        log(`[+] Extracting "${packageName}"..`);
        const extractRootFolder = extractRoots[packageName];

        await JSZip.loadAsync(blobData).then(async function(packageZip) {
            blobData = null;
            let fileGetPromises = [];

            packageZip.forEach(function(path, object) {
                if (path.endsWith("\\")) {
                    // If it's a directory, skip
                    return;
                }

                const fixedPath = path.replace(/\\/g, "/");
                const fileGetPromise = object.async("arraybuffer").then(function(data) {
                    zip.file(extractRootFolder + fixedPath, data);
                });

                fileGetPromises.push(fileGetPromise)
            });

            await Promise.all(fileGetPromises);
            packageZip = null;
        });

        log(`[+] Extracted "${packageName}"! (Packages left: ${getThreadsLeft()})`);
        doneCallback();
    });
};
