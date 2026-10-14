<template>
  <ion-app>
    <ion-router-outlet aria-label="Main content" :aria-hidden="false" />
  </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { onBeforeMount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSettings } from "@/utils/platform";

const route = useRoute();
const router = useRouter();
const { param, rid, website } = route.query;

window.addEventListener("hide.bs.modal", (event) => {
  (event.target as any)!.inert = true;
});
window.addEventListener("show.bs.modal", (event) => {
  (event.target as any)! = false;
});

// const pageListener = (
//   message: RequestArguments,
//   sender: any,
//   sendResponse: (a: any) => any
// ) => {
//   if (chrome.runtime.lastError) {
//     console.info("Error receiving message:", chrome.runtime.lastError);
//   }

//   return true;
// };

if (chrome?.runtime?.onMessage) {
  // chrome.runtime.onMessage.addListener(pageListener);
  console.info("page listener set");
}

onBeforeMount(() => {
  getSettings().then((settings) => {
    if (settings.theme !== "system") {
      document.body.classList.remove(settings.theme === "dark" ? "light" : "dark");
      document.body.classList.add(settings.theme);
    }
  });
});

onMounted(() => {
  switch (route?.query?.route ?? "") {
    default: {
      router.push({ path: "/" });
    }
  }
});
</script>
