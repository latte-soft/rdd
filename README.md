# RDD - "Roblox Deployment Downloader"

Static Site for Locally Downloading Complete Roblox Deployments (Windows/Mac, Player + Studio) Directly from Your Browser!
<br />
Hosted officially @ <https://rdd.latte.to>

## "Detailed" Explanation

RDD is a completely **static** website for locally downloading Roblox deployments; assembling plain resources directly from Roblox's `setup` S3 bucket, into a complete format the user would expect to be able to directly download and run directly, whatever it is. **Everything is fetched locally in your browser, without any required server resources!**

## Usage

```txt
[*] USAGE: https://rdd.latte.to/?channel=<CHANNEL_NAME>&binaryType=<BINARY_TYPE>&version=<VERSION_HASH>

    Binary Types:
    * WindowsPlayer
    * WindowsStudio64
    * MacPlayer
    * MacStudio
    
    Extra Notes:
    * If `channel` isn't provided, it will default to "LIVE" (psuedo identifier for
      the production channel)
    * You can provide `binaryType` to fetch the *latest* deployment on a channel, or
      BOTH `binaryType` and `version` to fetch a specific deployment of a specific
      binary type; for a specific `version`, you NEED to provide `binaryType` aswell

    You can also use an extra flag we provide, `blobDir`, for specifying where RDD
    should fetch deployment files/binaries from. This is ONLY useful for using
    different relative paths than normal, such as "/mac/arm64" which is specifically
    present on certain channels

    Blob Directories (Examples):
    * "/" (Default for WindowsPlayer/WindowsStudio64)
    * "/mac/" (Default for MacPlayer/MacStudio)
    * "/mac/arm64/"
    ..

```

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
