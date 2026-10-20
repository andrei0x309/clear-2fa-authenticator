<template>
  <ion-page>
    <ion-content>
      <ion-tabs @ionTabsWillChange="beforeTabChange" @ionTabsDidChange="afterTabChange">
        <ion-router-outlet aria-label="Tab content" />
        <ion-tab-bar
          slot="bottom"
          style="
            display: flex;
            flex-direction: column;
            height: 60px;
            box-shadow: -3px -1px #7e7e7e80;
          "
        >
          <div style="display: flex">
            <ion-tab-button tab="home" href="/tabs/home">
              <ion-icon :icon="personCircle"></ion-icon>
              <ion-label>Accounts</ion-label>
            </ion-tab-button>

            <ion-tab-button tab="settings" href="/tabs/settings">
              <ion-icon :icon="cogOutline"></ion-icon>
              <ion-label>Settings</ion-label>
            </ion-tab-button>

            <span
              v-if="version"
              @click="
                () => {
                  /*  openTab('https://clear-2fa-authenticator.flashsoft.eu/docs/automated-changelog/')  */
                }
              "
              style="
                position: absolute;
                right: 82%;
                margin-left: 0.3rem;
                color: var(--ion-color-medium-shade);
                font-weight: bold;
                font-size: 0.65rem;
                bottom: 2px;
              "
              class="link-docs"
              >Version: {{ version }}</span
            >
          </div>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonPage,
  IonContent,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
} from "@ionic/vue";
import { personCircle, cogOutline } from "ionicons/icons";

import { getVersion } from "@/utils/platform";

const version = getVersion();

const beforeTabChange = () => {
  // do something before tab change
};
const afterTabChange = () => {
  // do something after tab change
};
</script>
