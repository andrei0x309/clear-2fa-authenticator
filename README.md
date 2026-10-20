# ![CLW LOGO](/public/assets/extension-icon/app_32.png?raw=true "CLW LOGO") Clear 2FA Authenticator

## Description

Clear 2FA Authenticator is a browser extension that allows you to generate and use 2FA codes.

Features include:

- Shortcut key (default Ctrl+Q) to paste your 2FA token for the current page if it exists
- Right click to paste your 2FA token for the current page if it exists
- QR code import (both upload and tab capture)
- Import using json file
- Export to zip file that includes QR images for each account
- View or Download QR Code for each account
- Search for accounts
- Edit account
- Wipe all storage
- Light/Dark Theme

For more info, you can check [docs website](https://clear-2fa-authenticator.flashsoft.eu/)

Chrome Store Link: [https://chromewebstore.google.com/detail/clear-2fa-authenticator/ilobdcimfnfnlnkjobaolnfcnanneoja](https://chromewebstore.google.com/detail/clear-2fa-authenticator/ilobdcimfnfnlnkjobaolnfcnanneoja)

## How to Build from Github

```bash
git clone https://github.com/andrei0x309/clear-2fa-authenticator
cd clear-2fa-authenticator
bun install
bun run build # will build extension with chromium manifest
bun run build-firefox # will build extension with firefox manifest
```

This will create a Chromium extension in the dist folder.

You can also generate both Chromium and Firefox zip archives by running:

```bash
bun install
bun run rebuild
```

This will create both Firefox and Chromium extensions in these locations:

- releases/x.x.x.zip (chromium x is replaced with the version number)
- releases/firefox/x.x.x.zip (firefox x is replaced with the version number)

## Create Source Archive

```bash
bun run build-source
```

This will create a zip archive containing the source code in the releases/source/source-x.x.x.zip (x is replaced with the version number)

Building from source is similar:

```bash
cd source-x.x.x # x.x.x is replaced with the version number
bun install
bun run build # will build extension with chromium manifest
bun run build-firefox # will build extension with firefox manifest
```

<!-- ### Badges

[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=???)](https://sonarcloud.io/summary/new_code?id=???) -->

<!-- ### Extended article about this repo

### Latest Demo Clip
<!-- markdownlint-disable MD034 -->
<!--
https://github.com/user-attachments/assets/.... 
-->

### LINKS

[LICENSE.md](LICENSE.md)

[PRIVACY_POLICY.md](PRIVACY_POLICY.md)
