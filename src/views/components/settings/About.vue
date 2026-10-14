<template>
    <div class="ion-padding" slot="content" style="background: var(--ion-item-background, var(--ion-background-color, #fff));">
 
            <p>
              Clear 2FA Authenticator is a fully open-source 2FA authenticator built as a browser extension.
            </p>
            <p>
              Some of the features include:
              <ul>
              <li>Shortcut key (default Ctrl+Q) to paste your 2FA token for the current page if it exists</li>
              <li>Right click to paste your 2FA token for the current page if it exists</li>
              <li>Import using QR image for the current page</li>
              <li>Import using upload QR Image</li>
              <li>Import ussing json file</li>
              <li>Export using json file</li>
              <li>View or Download QR Code for each account</li>
              <li>Search for accounts</li>
              <li>Light/Dark Theme</li>
              </ul>
            </p>
            <p>
             If you want to help this project financially you can donate
              <a href="#" @click="openTab('https://blog.flashsoft.eu/tip-me')">here</a>
            </p>
            <p>
              Github Repo:
              <a href="#" @click="openTab('https://github.com/andrei0x309/clear-2fa-authenticator')"
                >LINK</a
              >
            </p>
            <p>
              Docs Website:
              <a href="#" @click="openTab('https://clear-2fa-authenticator.flashsoft.eu')">LINK</a>
            </p>
            <br />
            <p style="margin-bottom: 0.2rem">Places you can check me out:</p>
            <p>
              Github andrei0x309 -
              <a href="#" @click="openTab('https://github.com/andrei0x309')">LINK</a>
            </p>
            <p>
              Blog Flashsoft
              <a href="#" @click="openTab('https://blog.flashsoft.eu')">LINK</a>
            </p>
            <p>
                Daily Dev
                <a href="#" @click="openTab('https://daily.dev/andrei0x309')">LINK</a>
            </p>
          </div>
</template>

<script setup lang="ts">

import {
  openTab,
} from "@/utils/platform";

import { IonItem } from '@ionic/vue'

</script>