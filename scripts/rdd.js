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
[*] USAGE: ${basePath}?channel=<CHANNEL_NAME>&version=<VERSION_GUID>&blobDir=<BLOB_DIR>

    Binary Types:
    * WindowsPlayer
    * WindowsStudio64
    * MacPlayer
    * MacStudio
    
    Blob Directories (Examples):
    * "/" (Usually for WindowsPlayer/WindowsStudio files)
    * "/mac/"
    * "/mac/arm64/"
    
    Extra Notes:
    * If \`channel\` isn't provided, it will default to "LIVE" (psuedo identifier for production)
    * If \`blobDir\` isn't provided, it will default to "/". This query is only used if a specific
      \`version\` is set, and not if \`binaryType\` is. (Resolves itself) 
    * EITHER \`version\` or \`binaryType\` need to be provided, but never both
`;

const consoleText = document.getElementById("consoleText");
const downloadForm = document.getElementById("downloadForm");

function getFormInfo() {
    let channelName = downloadForm.channel.value.trim();
    if (channelName == "") {
        channelName = downloadForm.channel.placeholder;
    }

    return `${basePath}?channel=${channelName}&binaryType=${downloadForm.binaryType.value}`;
};

// Called upon the "Download" form button
function downloadFromFormInfo() {
    window.open(getFormInfo(), "_blank");
};

// Called upon the "Copy Permanent Link" form button
function copyFormInfo() {
    navigator.clipboard.writeText(getFormInfo());
};

const urlParams = new URLSearchParams(window.location.search);

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
const binaryTypeFileBindings = {
    WindowsPlayer: "/version",
    WindowsStudio64: "/versionQTStudio",
    MacPlayer: "/mac/version",
    MacStudio: "/mac/versionStudio"
};

const binaryTypeBlobDirs = {
    WindowsPlayer: "/",
    WindowsStudio64: "/",
    MacPlayer: "/mac/",
    MacStudio: "/mac/"
};

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

function escHtml(originalText) {
    return originalText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/ /g, "&nbsp;")
        .replace(/\n/g, "<br />");
};

function log(msg, end) {
    if (end == null) {
        end = "\n";
    }

    consoleText.innerHTML += escHtml(msg + end);
    scrollToBottom();
};

// Prompt download
function downloadBinaryFile(fileName, data) {
    const blob = new Blob([data], {type: "application/octet-stream"});

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    let button = document.createElement("button");
    button.innerHTML = `Redownload ${escHtml(fileName)}`;

    button.onclick = function() {
        link.click();
    };

    document.body.appendChild(button);
    scrollToBottom();

    button.click();
};

// Soley for the manifest etc
function request(url, callback, method) {
    if (method == null) {
        method = "GET"
    }

    const httpRequest = new XMLHttpRequest();
    httpRequest.open(method, url, true);

    // When the request is done later..
    httpRequest.onload = function() {
        // Handle req issues, and don't call-back
        const statusCode = httpRequest.status
        if (statusCode < 200 || statusCode >= 400) {
            log(`[!] Request error (${statusCode}) @ ${url} - ${httpRequest.responseText}`);
            return;
        }

        callback(httpRequest.responseText, statusCode);
    };

    httpRequest.onerror = function(e) {
        log(`[!] Request error (${statusCode}) @ ${url} - ${e.msg}`);
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
        log(`[!] Binary request error (${statusCode}) @ ${url} - ${e}`);
    };

    httpRequest.send();
};

// Soley for enumerating possible vals on S3
function checkFileExists(url, callback, callbackValue) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", url, true);

    httpRequest.onload = function() {
        if (httpRequest.status != 200) {
            return; // Ignore for the ret
        }

        callback(callbackValue);
    };
    
    httpRequest.send();
};

// For file bindings
function fileNameWithoutExt(fileName) {
    return fileName.replace(/\.[^.]+$/, '');
};

let channel;
let version;
let binaryType;
let blobDir;
let hostPath;

let channelPath;
let versionPath;

let extractRoots;
let zip;

function main() {
    if (window.location.search == "") {
        // We won't log anything else; just exit
        downloadForm.hidden = false;
        log(usageMsg);
        return;
    }

    // "Internal"
    if (urlParams.has("_hostPath") && urlParams.get("_hostPath") != "") {
        hostPath = urlParams.get("_hostPath");

        // If there's a "/" at the end, remove it
        if (hostPath.slice(-1) == "/") {
            hostPath = hostPath.slice(0, -1);
        }
    } else {
        hostPath = "https://roblox-setup.cachefly.net"; // setup.rbxcdn.com doesn't have the proper CORS cfg
    }

    // Optional
    if (urlParams.has("channel") && urlParams.get("channel") != "") {
        channel = urlParams.get("channel");
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

    // This is overriden later if binaryType was explicitly set, as it would be able to
    // resolve this itself, regardless
    if (urlParams.has("blobDir") && urlParams.get("blobDir") != "") {
        blobDir = urlParams.get("blobDir");
        if (blobDir.slice(-1) != "/") {
            blobDir += "/"
        }
        if (blobDir.slice(0) != "/") {
            blobDir = "/" + blobDir;
        }
    } else {
        blobDir = "/";
    }

    // *Required
    if (urlParams.has("version") && urlParams.get("version") != "") {
        // Can't have both
        if (urlParams.has("binaryType") && urlParams.get("binaryType") != "") {
            log("[!] Error: You cannot have both `version`, AND `channel` set; look at your query path again!");
            log(usageMsg);
            return;
        }

        version = urlParams.get("version");
        fetchManifest();
    } else if (urlParams.has("binaryType") && urlParams.get("binaryType") != "") {
        binaryType = urlParams.get("binaryType");

        let versionFilePath;
        if (binaryType in binaryTypeFileBindings) {
            const binaryTypeFileBinding = binaryTypeFileBindings[binaryType];

            versionFilePath = channelPath + binaryTypeFileBinding;

            // We'll also now override this for later; if it's in these file bindings, it's supposed to be in here too
            blobDir = binaryTypeBlobDirs[binaryType];
        } else {
            log(`[!] Error: \`binaryType\` given, "${binaryType}" not supported. See list below for supported BinaryTypes`);
            log(usageMsg);
            return;
        }

        log(`[+] Fetching version for ${binaryType}@${channel}.. `, "");
        
        request(versionFilePath, function(versionBody) {
            log("done!");
            version = versionBody;
            fetchManifest();
        });
    } else {
        log("[!] Error: Missing `version` or `binaryType` queries (ONE is requred)");
        log(usageMsg);
        return;
    }
};

function fetchManifest() {
    versionPath = `${channelPath}${blobDir}${version}-`;

    // If it's a Mac bin we need to deal with..
    if (binaryType == "MacPlayer" || binaryType == "MacStudio" || blobDir.slice(0, 4) == "/mac") {
        log("[+] Checking for MacPlayer/MacStudio blobs.. ", "");
        checkFileExists(versionPath + "RobloxVersion.txt", getFileNameCallback, "RobloxPlayer.zip");
        checkFileExists(versionPath + "RobloxStudioVersion.txt", getFileNameCallback, "RobloxStudioApp.zip");

        function getFileNameCallback(zipFileName) {
            log(`done!`);

            if (! binaryType) {
                if (zipFileName == "RobloxPlayer.zip") {
                    binaryType = "MacPlayer";
                } else if (zipFileName == "RobloxStudioApp.zip") {
                    binaryType = "MacStudio";
                }
            }

            const outputFileName = `${channel}-${binaryType}-${version}.zip`;
            log(`[+] (Please wait!) Downloading ${outputFileName}..`, "");

            requestBinary(versionPath + zipFileName, function(zipData) {
                log("done!");
                downloadBinaryFile(outputFileName, zipData);
            });
        };

        return;
    }

    // Now, we're dealing with soley Windows bin logic

    log(`[+] Fetching rbxPkgManifest for ${version}@${channel}.. `, "");
    request(versionPath + "rbxPkgManifest.txt", getManifestCallback);
};

async function getManifestCallback(manifestBody) {
    log("done!");
    pkgManifestLines = manifestBody.split("\n").map(line => line.trim());

    if (pkgManifestLines[0] != "v0") {
        log(`[!] Error: rbxPkgManifest manifest version incorrect; expected "v0", got "${pkgManifestLines[0]}"`);
        return
    }

    // We need to decide with "extraction roots" we're allocating
    if (pkgManifestLines.includes("RobloxApp.zip")) {
        extractRoots = extractRootsDict.player;
        binaryType = "WindowsPlayer";
    } else if (pkgManifestLines.includes("RobloxStudio.zip")) {
        extractRoots = extractRootsDict.studio;
        binaryType = "WindowsStudio";
    } else {
        log("[!] Error: Bad/unrecognized rbxPkgManifest, aborting..");
        return;
    }

    log(`[+] Fetching blobs for BinaryType \`${binaryType}\`..`);

    zip = new JSZip();
    
    // For both WindowsPlayer and WindowsStudio
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
        pkgManifestLine = pkgManifestLines[index];
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
    blobUrl = versionPath + packageName;

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
            fileGetPromises = [];

            packageZip.forEach(function(path, object) {
                if (path.endsWith("\\")) {
                    // If it's a directory, skip
                    return;
                }

                const fixedPath = path.replace(/\\/g, "/");

                fileGetPromise = object.async("arraybuffer").then(function(data) {
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

// Init
main();
