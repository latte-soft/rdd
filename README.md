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

See [LICENSE.txt](LICENSE.txt)

```
MIT License

Copyright (c) 2023 Latte Softworks <https://latte.to>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
