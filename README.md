# RDD - "Roblox Deployment Downloader"

Static Site for Locally Downloading Complete Roblox Deployments (Windows/Mac, Player + Studio) Directly from Your Browser!
<br />
Hosted officially @ <https://rdd.latte.to>

## "Detailed" Explanation

RDD is a completely **static** website for locally downloading Roblox deployments; assembling plain resources directly from Roblox's `setup` S3 bucket, into a complete format the user would expect to be able to directly download and run directly, whatever it is. **Everything is fetched locally in your browser, without any required server resources!**

## Usage

```txt
[*] USAGE: https://rdd.latte.to/?channel=<CHANNEL_NAME>&version=<VERSION_GUID>&blobDir=<BLOB_DIR>
    OR
[*] USAGE: https://rdd.latte.to/?channel=<CHANNEL_NAME>&binaryType=<BINARY_TYPE>

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
    * If `channel` isn't provided, it will default to "LIVE" (psuedo identifier for production)
    * If `blobDir` isn't provided, it will default to "/". This query is only used if a specific
      `version` is set, and not if `binaryType` is. (Resolves itself) 
    * EITHER `version` or `binaryType` need to be provided, but never both

```

### Usage Example - Permanent links for the *latest* deployment on the production channel ("`LIVE`")

* <https://rdd.latte.to/?binaryType=WindowsPlayer>
* <https://rdd.latte.to/?binaryType=WindowsStudio64>
* <https://rdd.latte.to/?binaryType=MacPlayer>
* <https://rdd.latte.to/?binaryType=MacStudio>

### Extra Usage Examples

<sup><i>Please don't use the specific-version bins listed here, they're soley for demonstrating some different uses of RDD!</i></sup>

* <https://rdd.latte.to/?channel=zintegration&binaryType=WindowsPlayer>
* <https://rdd.latte.to/?channel=zintegration&binaryType=WindowsStudio64>
* <https://rdd.latte.to/?binaryType=MacPlayer>
* <https://rdd.latte.to/?binaryType=MacStudio>
* <https://rdd.latte.to/?channel=zintegration&version=version-a2ffc572ecd64e2b>
* <https://rdd.latte.to/?channel=zintegration&version=version-14b4aedf5b9f427d&blobDir=mac>

## Extras

* [JSZip (Used to power `WindowsPlayer`/`WindowsStudio` file extraction/generation, give it's repo a star!)](https://github.com/Stuk/jszip)
* [Latte Softworks Discord Community](https://latte.to/discord)
* <https://github.com/latte-soft/channel-tracker>

## License

See [LICENSE.txt](LICENSE.txt), or visit <https://www.gnu.org/licenses/gpl-3.0.html>

```
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
```
