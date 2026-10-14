<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title v-if="!isEdit">Add Account</ion-title>
        <ion-title v-else>Edit Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-input
          label="Service/App*"
          labelPlacement="stacked"
          v-model="service"
          fill="outline"
          placeholder="Google"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-input
          label="Account*"
          labelPlacement="stacked"
          v-model="account"
          fill="outline"
          placeholder="andrei@gmail.com"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-input
          label="Website"
          labelPlacement="stacked"
          v-model="website"
          fill="outline"
          placeholder="https://google.com"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-input
          label="Secret*"
          labelPlacement="stacked"
          id="pasteSecret"
          v-model="secret"
          fill="outline"
          placeholder="NB4NMYLNQU6DIVNH"
        ></ion-input>
        <ion-icon
          style="margin-right: 0.5rem; cursor: pointer"
          @click="paste('pasteSecret')"
          :icon="clipboardOutline"
          button
        />
      </ion-item>
      <ion-item>
        <ion-button
          @click="getQrFromTab"
          size="small"
          style="margin-left: auto; margin-right: auto; font-size: 0.71rem; width: 100%"
          expand="full"
        >
          <ion-icon slot="start" :icon="scanOutline"></ion-icon>
          Extract Data from QR on the current page</ion-button
        >
      </ion-item>
      <ion-item>
        <ion-button
          @click="uploadQr"
          size="small"
          style="margin-left: auto; margin-right: auto; font-size: 0.71rem; width: 100%"
          expand="full"
        >
          <ion-icon slot="start" :icon="cloudUpload"></ion-icon>
          Extract Data from uploaded QR image</ion-button
        >
        <input
          ref="qrFileUpload"
          type="file"
          accept="image/*"
          class="file-input-cls"
          id="qrFileUpload"
          style="display: none"
        />
      </ion-item>
      <ion-item>
        <div style="margin-left: auto; display: flex">
          <ion-button @click="onCancel">Cancel</ion-button>
          <ion-button @click="onSave" expand="full" color="primary">{{
            isEdit ? "Edit Account" : "Add Account"
          }}</ion-button>
        </div>
      </ion-item>
      <ion-alert
        :is-open="alertOpen"
        header="Error"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>
      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { Ref } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonAlert,
  IonIcon,
  onIonViewWillEnter,
  modalController,
  IonModal,
  IonButtons,
  IonTextarea,
} from "@ionic/vue";
import {
  saveSelectedAccount,
  getAccounts,
  saveAccount,
  smallRandomString,
  paste,
  getSettings,
  replaceAccounts,
  getNextIdAccounts,
} from "@/utils/platform";
import router from "@/router";
import { useRoute } from "vue-router";
import type { Account, Settings } from "@/extension/types";
import UnlockModal from "@/views/UnlockModal.vue";
import { encrypt, getCryptoParams } from "@/utils/webCrypto";

import { clipboardOutline } from "ionicons/icons";
import { setUnlockModalState } from "@/utils/unlockStore";
import { isValidDomain, extractDomainWthoutWww } from "@/utils/misc";
import { decodeOtpSecret, generateOTP } from "@/utils/OTP";
import { getQRCode } from "@/utils/QR";

import { cloudUpload, scanOutline } from "ionicons/icons";

const route = useRoute();

const service = ref("");
const account = ref("");
const routeId = Number(route.params.accountId ?? 0);

const id = ref(routeId);
const website = ref("");
const secret = ref("");
const alertOpen = ref(false);
const alertMsg = ref("");
const loading = ref(false);

const isEdit = route.path.includes("/edit");
const mnemonicModal = ref(false);
const qrFileUpload = (ref(null) as unknown) as Ref<HTMLInputElement>;

let accountsProm: Promise<Account[] | undefined>;
let settingsProm: Promise<Settings | undefined>;

const resetFields = () => {
  service.value = "";
  account.value = "";
  website.value = "";
  secret.value = "";
};

const uploadQr = async () => {
  qrFileUpload.value.click();
  await new Promise((resolve) => {
    qrFileUpload.value.addEventListener("change", () => {
      resolve("");
    });
  });
  // check file exists
  if (!qrFileUpload?.value?.files || qrFileUpload?.value?.files?.length === 0) {
    return;
  }

  const file = qrFileUpload.value.files[0];
  // convert file to base64
  const reader = new FileReader();

  reader.onload = async (event) => {
    const base64 = (event?.target?.result as string) || "";

    const qr = (await getQRCode(base64)) || "";

    if (!qr) {
      alertMsg.value = "No valid QR code found in the image.";
      alertOpen.value = true;
      return;
    }

    try {
      const decoded = decodeOtpSecret(qr);
      secret.value = decoded.cleaned;

      if (decoded.hasOTPAuthData) {
        service.value = (decoded?.otpauthData?.service as string) || "";
        account.value = (decoded?.otpauthData?.account as string) || "";
        website.value = (decoded?.otpauthData?.otpauthData as string) || "";

        if (
          !website.value.startsWith("http://") &&
          !website.value.startsWith("https://")
        ) {
          website.value = "https://" + website.value;
        }
      }
    } catch (e) {
      alertMsg.value = "Invalid secret.";
      alertOpen.value = true;
      return;
    }
  };
  reader.readAsDataURL(file);
};

const getQrFromTab = async () => {
  const data = await chrome.tabs.captureVisibleTab({
    format: "png",
    quality: 100,
  });
  const qr = (await getQRCode(data)) || "";

  if (!qr) {
    alertMsg.value =
      "No valid QR code found, on the active tab, please ensure the QR code is visible.";
    alertOpen.value = true;
    return;
  }

  try {
    const decoded = decodeOtpSecret(qr);
    secret.value = decoded.cleaned;

    if (decoded.hasOTPAuthData) {
      service.value = (decoded?.otpauthData?.service as string) || "";
      account.value = (decoded?.otpauthData?.account as string) || "";
    }
  } catch (e) {
    alertMsg.value = "Invalid secret.";
    alertOpen.value = true;
    return;
  }
};

const openModal = async () => {
  const modal = await modalController.create({
    component: UnlockModal,
    animated: true,
    focusTrap: false,
    backdropDismiss: false,
    componentProps: {
      unlockType: "addAccount",
    },
  });
  await modal.present();
  setUnlockModalState(true);
  const { role, data } = await modal.onWillDismiss();
  if (role === "confirm") return data;
  setUnlockModalState(false);
  return false;
};

onIonViewWillEnter(async () => {
  console.log(id.value);
  if (isEdit) {
    loading.value = true;
    accountsProm = getAccounts();
    const accounts = (await accountsProm) as Account[];
    console.log(accounts);
    const acc = accounts.find((account) => account.id === id.value);
    if (acc) {
      service.value = acc.service;
      account.value = acc.account;
      const webAddress = acc.website || "";
      if (!webAddress.startsWith("http://") && !webAddress.startsWith("https://")) {
        website.value = "https://" + webAddress;
      }
      secret.value = acc.otpSecret;
    }
    loading.value = false;
  }
});

const validateAccount = async () => {
  if (account.value.trim().length < 1) {
    alertMsg.value = "Account cannot be empty.";
    alertOpen.value = true;
    return false;
  }

  if (service.value.trim().length < 1) {
    alertMsg.value = "Service/App cannot be empty.";
    alertOpen.value = true;
    return false;
  }

  website.value = website.value.trim();

  if (website.value.length > 0) {
    if (!website.value.startsWith("http://") && !website.value.startsWith("https://")) {
      website.value = "https://" + website.value;
    }

    if (!isValidDomain(website.value)) {
      alertMsg.value = "Invalid website.";
      alertOpen.value = true;
      return false;
    }
  }

  if (secret.value.trim().length < 1) {
    alertMsg.value = "Secret cannot be empty.";
    alertOpen.value = true;
    return false;
  }

  return true;
};

const onSave = async () => {
  if (!(await validateAccount())) {
    return;
  }

  const accountId = id.value || (await getNextIdAccounts());

  try {
    secret.value = decodeOtpSecret(secret.value).cleaned;
  } catch (e) {
    alertMsg.value = "Invalid secret.";
    alertOpen.value = true;
    return;
  }

  let code = "";

  try {
    code = await generateOTP({
      secret: secret.value,
    });
  } catch (e) {
    console.log(e);
    alertMsg.value = "Invalid secret.";
    alertOpen.value = true;
    return;
  }

  if (code.length !== 6) {
    console.log(code);
    alertMsg.value = "Invalid secret.";
    alertOpen.value = true;
    return;
  }

  const acc = {
    id: accountId,
    service: service.value.trim(),
    account: account.value.trim(),
    website: extractDomainWthoutWww(website.value.trim()),
    otpSecret: secret.value,
  };
  await saveAccount(acc);

  router.push("/tabs/home");
};

const onCancel = () => {
  resetFields();
  router.push("/tabs/home");
};
</script>

<style scoped>
.input-fill-outline.sc-ion-input-md-h {
  min-height: 38px;
}

input {
  font-size: 0.8rem;
}
</style>
