[commits]: https://github.com/latte-soft/rdd/commits
[badges/last-modified]: https://img.shields.io/github/last-commit/latte-soft/rdd?label=Last%20Modifed

## RDD ("Roblox Deployment Downloader")

[![Last Modified][badges/last-modified]][commits]

Locally download Roblox deployments (Windows/Mac) directly from your browser!

Hosted officially @ <https://rdd.latte.to>

### What is this?

RDD can assemble plain resources directly from Roblox's [`setup`](https://setup.rbxcdn.com) S3 storage bucket into a format the user would expect to be able to directly extract/run from. **Everything is fetched locally in your browser, without any additional required server resources!**

### Usage

```txt
[*] USAGE: https://rdd.latte.to/?channel=<CHANNEL_NAME>&binaryType=<BINARY_TYPE>&version=<VERSION_HASH>

    Binary Types:
    * WindowsPlayer
    * WindowsStudio64
    * MacPlayer
    * MacStudio
    
    Extra Notes:
    * If `channel` isn't provided, it will default to "LIVE" (pseudo identifier for
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

### Extras

* [JSZip](https://github.com/Stuk/jszip) (Used for `WindowsPlayer`/`WindowsStudio` file extraction/generation)
* <https://github.com/latte-soft/channel-tracker>

## License

See file: [LICENSE](LICENSE)

```
MIT License

Copyright (c) 2024-2025 Latte Softworks <https://latte.to>

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
