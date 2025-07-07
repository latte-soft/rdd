/*
    rdd - https://github.com/latte-soft/rdd

    Copyright (C) 2024-2025 Latte Softworks <latte.to> | MIT License
*/

const basePath = window.location.href.split("?")[0];
const usageMsg = `[*] USAGE: ${basePath}?channel=<CHANNEL_NAME>&binaryType=<BINARY_TYPE>&version=<VERSION_HASH>

    Binary Types:
    * WindowsPlayer
    * WindowsStudio64
    * MacPlayer
    * MacStudio

    Extra Notes:
    * If \`channel\` isn't provided, it will default to "LIVE" (the production channel)

    You can also use an extra query argument we provide, \`blobDir\`, for specifying
    where RDD should fetch deployment files from. This is useful for using different
    relative directories than normal for a certain client type, such as for fetching
    stuff from /mac/arm64/ instead of /mac/

    Blob Directories (Examples):
    * "/" (Default for WindowsPlayer/WindowsStudio64)
    * "/mac/" (Default for MacPlayer/MacStudio)
    * "/mac/arm64/"
    ..
`;

const hostPath = "https://setup-aws.rbxcdn.com"; // Only the AWS mirror has proper CORS cfg

// Root extract locations for the Win manifests
const extractRoots = {
    player: {
        "RobloxApp.zip": "",
        "redist.zip": "",
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

        "content-platform-fonts.zip": "PlatformContent/pc/fonts/",
        "content-platform-dictionaries.zip": "PlatformContent/pc/shared_compression_dictionaries/",
        "content-terrain.zip": "PlatformContent/pc/terrain/",
        "content-textures3.zip": "PlatformContent/pc/textures/",

        "extracontent-luapackages.zip": "ExtraContent/LuaPackages/",
        "extracontent-translations.zip": "ExtraContent/translations/",
        "extracontent-models.zip": "ExtraContent/models/",
        "extracontent-textures.zip": "ExtraContent/textures/",
        "extracontent-places.zip": "ExtraContent/places/"
    },

    studio: {
        "RobloxStudio.zip": "",
        "RibbonConfig.zip": "RibbonConfig/",
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
        "content-platform-dictionaries.zip": "PlatformContent/pc/shared_compression_dictionaries/",
        "content-terrain.zip": "PlatformContent/pc/terrain/",
        "content-textures3.zip": "PlatformContent/pc/textures/",

        "extracontent-translations.zip": "ExtraContent/translations/",
        "extracontent-luapackages.zip": "ExtraContent/LuaPackages/",
        "extracontent-textures.zip": "ExtraContent/textures/",
        "extracontent-scripts.zip": "ExtraContent/scripts/",
        "extracontent-models.zip": "ExtraContent/models/",

        "studiocontent-models.zip": "StudioContent/models/",
        "studiocontent-textures.zip": "StudioContent/textures/"
    }
};

const binaryTypes = {
    WindowsPlayer: {
        //versionFile: "/version",
        blobDir: "/"
    },
    WindowsStudio64: {
        //versionFile: "/versionQTStudio",
        blobDir: "/"
    },
    MacPlayer: {
        //versionFile: "/mac/version",
        blobDir: "/mac/"
    },
    MacStudio: {
        //versionFile: "/mac/versionStudio",
        blobDir: "/mac/"
    },
}

const urlParams = new URLSearchParams(window.location.search);

const consoleText = document.getElementById("consoleText");
const downloadForm = document.getElementById("downloadForm");
const downloadFormDiv = document.getElementById("downloadFormDiv");

function getPermLink() {
    const channelName = downloadForm.channel.value.trim() || downloadForm.channel.placeholder;
    let queryString = `?channel=${encodeURIComponent(channelName)}&binaryType=${encodeURIComponent(downloadForm.binaryType.value)}`;

    const versionHash = downloadForm.version.value.trim();
    if (versionHash !== "") {
        queryString += `&version=${encodeURIComponent(versionHash)}`;
    }

    const compressZip = downloadForm.compressZip.checked;
    const compressionLevel = downloadForm.compressionLevel.value;
    if (compressZip === true) {
        queryString += `&compressZip=true&compressionLevel=${compressionLevel}`;
    }

    return basePath + queryString;
};

function downloadFromForm() {
    window.open(getPermLink(), "_self");
};

function copyPermLink() {
    navigator.clipboard.writeText(getPermLink());
};

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight
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
        .replace(/\n/g, "<br>");
};

function log(msg = "", end = "\n", autoScroll = true) {
    consoleText.append(msg + end);
    if (autoScroll) {
        scrollToBottom();
    }
};

// Prompt download
function downloadBinaryFile(fileName, data, mimeType = "application/zip") {
    const blob = new Blob([data], { type: mimeType });

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    let button = document.createElement("button");
    button.innerText = `${fileName}`;
    link.appendChild(button);

    document.body.appendChild(link);
    scrollToBottom();

    button.click();
};

function requestBinary(url, callback) {
    const httpRequest = new XMLHttpRequest();

    httpRequest.open("GET", url, true);
    httpRequest.responseType = "arraybuffer";

    // When the request is done later..
    httpRequest.onload = function() {
        // Handle req issues, and don't call-back
        const statusCode = httpRequest.status;
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

let channel = getQuery("channel");
let version = getQuery("version") || getQuery("guid");
let binaryType = getQuery("binaryType");
let blobDir = getQuery("blobDir");

let compressZip = getQuery("compressZip");
let compressionLevel = getQuery("compressionLevel");

let channelPath;
let versionPath;

let binExtractRoots;
let zip;

main();

function main() {
    if (window.location.search === "") {
        downloadFormDiv.hidden = false;
        log(usageMsg, "\n", false);
        return;
    }

    // Query params

    if (channel !== null) {
        if (channel !== "LIVE") {
            channel = channel.toLowerCase();
        }
    } else {
        channel = "LIVE";
    }

    if (channel === "LIVE") {
        channelPath = `${hostPath}`;
    } else {
        channelPath = `${hostPath}/channel/${channel}`;
    }

    if (version !== null) {
        version = version.toLowerCase();
        if (! version.startsWith("version-")) { // Only the version GUID is actually necessary
            version = "version-" + version;
        }
    }

    // We're also checking to make sure blobDir hasn't been included too for the compatibility warning later
    if (version && ! binaryType) {
        log("[!] Error: If you provide a specific `version`, you need to set the `binaryType` aswell! See the usage doc below for examples of various `binaryType` inputs:", "\n\n");
        log(usageMsg, "\n", false);
        return;
    }

    if (blobDir !== null && blobDir !== "") {
        if (blobDir.slice(0) !== "/") {
            blobDir = "/" + blobDir;
        }
        if (blobDir.slice(-1) !== "/") {
            blobDir += "/";
        }
    }

    if (compressZip !== null) {
        if (compressZip !== "true" && compressZip !== "false") {
            log(`[!] Error: The \`compressZip\` query must be "true" or "false", got "${compressZip}"`);
        }

        compressZip = (compressZip === "true");
    } else {
        compressZip = downloadForm.compressZip.checked;
    }

    if (compressionLevel !== null) {
        try {
            compressionLevel = parseInt(compressionLevel);
        } catch (err) {
            log(`[!] Error: Failed to parse \`compressionLevel\` query: ${err}`, "\n\n");
            log(usageMsg, "\n", false);
            return;
        }

        if (compressionLevel > 9 || compressionLevel < 1) {
            log(`[!] Error: The \`compressionLevel\` query must be a value between 1 and 9, got ${compressionLevel}`, "\n\n");
            log(usageMsg, "\n", false);
            return;
        }
    } else {
        compressionLevel = downloadForm.compressionLevel.value; // Only applies to when `compressZip` is true aswell
    }

    // At this point, we expect `binaryType` to be defined
    if (! binaryType) {
        log("[!] Error: Missing required \`binaryType\` query, are you using an old perm link for a specific version?", "\n\n");
        log(usageMsg, "\n", false);
        return;
    }

    if (binaryType in binaryTypes) {
        const binaryTypeObject = binaryTypes[binaryType];

        // If `blobDir` has already been defined by the user, we don't want to override it here
        if (! blobDir) {
            blobDir = binaryTypeObject.blobDir;
        }
    } else {
        log(`[!] Error: \`binaryType\` "${binaryType}" not supported. See below for supported \`binaryType\` inputs:`, "\n\n");
        log(usageMsg);
        return;
    }

    if (version) {
        fetchManifest();
    } else {
        const binaryTypeEncoded = escHtml(binaryType);
        const channelNameEncoded = escHtml(channel);

        const clientSettingsUrl = `https://clientsettings.roblox.com/v2/client-version/${binaryTypeEncoded}/channel/${channelNameEncoded}`;
        log("Copy the version hash (the area with \"version-xxxxxxxxxxxxxxxx\" in double-quotes) from the page in the link below (we can't because of CORS), and paste it in the field named \"Version Hash\" in the form above\n");
        consoleText.innerHTML += `<a target="_blank" href="${clientSettingsUrl}">${clientSettingsUrl}</a><br><br><br>`;

        // Same options as may have been input from the page before
        downloadForm.channel.value = channelNameEncoded;
        downloadForm.binaryType.value = binaryTypeEncoded;
        downloadForm.compressZip.checked = compressZip;
        downloadForm.compressionLevel.value = compressionLevel;

        downloadFormDiv.hidden = false;

        return;
    }
};

async function fetchManifest() {
    versionPath = `${channelPath}${blobDir}${version}-`;

    if (binaryType === "MacPlayer" || binaryType === "MacStudio") {
        const zipFileName = (binaryType == "MacPlayer" && "RobloxPlayer.zip") || (binaryType == "MacStudio" && "RobloxStudioApp.zip");
        log(`[+] Fetching zip archive for BinaryType "${binaryType}" (${zipFileName})`);

        const outputFileName = `${channel}-${binaryType}-${version}.zip`;
        log(`[+] (Please wait!) Downloading ${outputFileName}..`, "");

        requestBinary(versionPath + zipFileName, function(zipData) {
            log("done!");
            downloadBinaryFile(outputFileName, zipData);
        });
    } else {
        // Now, we're only dealing with Windows bin logic
        log(`[+] Fetching rbxPkgManifest for ${version}@${channel}..`);

        // TODO: This is terrible, just a temp fix so we don't get 5 billion issue reports for not supporting /channel/common/
        var manifestBody = "";
        {
            var resp = await fetch(versionPath + "rbxPkgManifest.txt");
            if (! resp.ok) {
                channelPath = `${hostPath}/channel/common`;
                versionPath = `${channelPath}${blobDir}${version}-`;

                resp = await fetch(versionPath + "rbxPkgManifest.txt");
            }

            if (! resp.ok) {
                log(`[!] Failed to fetch rbxPkgManifest: (status: ${resp.status}, err: ${(await resp.text()) || "<failed to get response from server>"})`);
                return;
            }

            manifestBody = await resp.text();
        }

        downloadZipsFromManifest(manifestBody);
    }
};

async function downloadZipsFromManifest(manifestBody) {
    const pkgManifestLines = manifestBody.split("\n").map(line => line.trim());

    if (pkgManifestLines[0] !== "v0") {
        log(`[!] Error: unknown rbxPkgManifest format version; expected "v0", got "${pkgManifestLines[0]}"`);
        return;
    }

    if (pkgManifestLines.includes("RobloxApp.zip")) {
        binExtractRoots = extractRoots.player;

        if (binaryType === "WindowsStudio64") {
            log(`[!] Error: BinaryType \`${binaryType}\` given, but "RobloxApp.zip" was found in the manifest!`);
            return;
        }
    } else if (pkgManifestLines.includes("RobloxStudio.zip")) {
        binExtractRoots = extractRoots.studio;

        if (binaryType === "WindowsPlayer") {
            log(`[!] Error: BinaryType \`${binaryType}\` given, but "RobloxStudio.zip" was found in the manifest!`);
            return;
        }
    } else {
        log("[!] Error: Bad/unrecognized rbxPkgManifest, aborting");
        return;
    }

    log(`[+] Fetching blobs for BinaryType \`${binaryType}\`..`);

    zip = new JSZip();

    // For both WindowsPlayer and WindowsStudio64
    zip.file("AppSettings.xml", `<?xml version="1.0" encoding="UTF-8"?>
<Settings>
\t<ContentFolder>content</ContentFolder>
\t<BaseUrl>http://www.roblox.com</BaseUrl>
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
        if (! pkgManifestLine.endsWith(".zip")) {
            // Not a package in the manifest. Should I be using the checksum? Yes.. I'll do it later. Maybe.
            continue;
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
        log();
        if (compressZip) {
            log(`[!] NOTE: Compressing final zip (with a compression level of ${compressionLevel}/9), this may take a minute`);
        }

        log(`[+] Exporting assembled zip file "${outputFileName}".. `, "");

        zip.generateAsync({
            type: "arraybuffer",
            compression: compressZip ? "DEFLATE" : "STORE",
            compressionOptions: {
                level: compressionLevel
            }
        }).then(function(outputZipData) {
            zip = null;
            log("done!");
            downloadBinaryFile(outputFileName, outputZipData);
        });
    };

    checkIfNoThreadsLeft();
};

async function downloadPackage(packageName, doneCallback, getThreadsLeft) {
    log(`[+] Fetching "${packageName}"..`);
    const blobUrl = versionPath + packageName;

    requestBinary(blobUrl, async function(blobData) {
        if (packageName in binExtractRoots == false) {
            log(`[*] Package name "${packageName}" not defined in extraction roots for BinaryType \`${binaryType}\`, skipping extraction! (THIS MAY MAKE THE ZIP OUTPUT INCOMPLETE, BE AWARE!)`);
            zip.file(packageName, blobData);
            log(`[+] Moved package "${packageName}" directly to the root folder`);
            doneCallback();
            return;
        }

        log(`[+] Extracting "${packageName}"..`);
        const extractRootFolder = binExtractRoots[packageName];

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

                fileGetPromises.push(fileGetPromise);
            });

            await Promise.all(fileGetPromises);
            packageZip = null;
        });

        log(`[+] Extracted "${packageName}"! (Packages left: ${getThreadsLeft()})`);
        doneCallback();
    });
};
