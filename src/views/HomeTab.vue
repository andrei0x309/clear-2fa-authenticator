<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-avatar
            @click="openTab('https://clear-2fa-authenticator.flashsoft.eu/docs/')"
            class="link-docs"
            style="margin: 0.3rem; width: 1.6rem; height: 1.6rem; display: inline-flex"
          >
            <img alt="clw" :src="getUrl('assets/extension-icon/app_32.png')" />
          </ion-avatar>
          <span
            @click="openTab('https://clear-2fa-authenticator.flashsoft.eu/docs/')"
            class="link-docs"
            style="position: absolute; top: 0.35rem; margin-left: 0.3rem"
          >
            <span style="font-size: 1rem; font-weight: bold">Clear 2FA</span>
          </span>

          <ion-button
            style="
              position: absolute;
              right: 1.1rem;
              margin-left: 0.3rem;
              color: #aca3bb;
              font-size: 0.75rem;
              height: 1.6rem;
              top: -1px;
            "
            color="primary"
            fill="outline"
            @click="goToAddAccount"
          >
            <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>

            Add Account</ion-button
          >
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <template v-if="accounts.length && !loading">
        <ion-list-header>
          <ion-searchbar
            ref="accountSearchBar"
            placeholder="search..."
            autocomplete="off"
            :autocorrect="false"
            :clear-input="false"
            :clear-on-edit="false"
            :spellcheck="false"
            :tabindex="0"
            @ionInput="searchAccount"
          ></ion-searchbar>
        </ion-list-header>

        <ion-card v-for="account in filtredAccounts" :key="account.id">
          <ion-card-header>
            <ion-card-title style="font-size: 1.15rem; width: 95%">{{
              account.service + " " + account.account
            }}</ion-card-title>
            <ion-card-subtitle>{{ account.website }}</ion-card-subtitle>

            <div style="position: absolute; top: 0.5rem; right: 0.5rem">
              <ion-button
                shape="round"
                fill="clear"
                size="small"
                @click="openPopover(account.id, $event)"
              >
                <ion-icon slot="icon-only" :icon="ellipsisVertical"></ion-icon>
              </ion-button>
              <ion-popover
                :is-open="popovers[account.id]"
                :event="event"
                @didDismiss="closePopover(account.id)"
                class="otpmenu"
              >
                <ion-content style="display: flex; flex-direction: column">
                  <ion-button
                    style="display: block; margin-bottom: 0.5rem; font-size: 0.66rem"
                    @click="edit(account.id)"
                    size="small"
                  >
                    <ion-icon slot="start" :icon="pencil"></ion-icon>
                    Edit</ion-button
                  >
                  <ion-button
                    style="display: block; margin-bottom: 0.5rem; font-size: 0.66rem"
                    @click="view(account.id)"
                    size="small"
                  >
                    <ion-icon slot="start" :icon="eyeOutline"></ion-icon>
                    View QR</ion-button
                  >
                  <ion-button
                    style="display: block; margin-bottom: 0.5rem; font-size: 0.66rem"
                    @click="download(account.id)"
                    size="small"
                  >
                    <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
                    Download QR</ion-button
                  >
                  <ion-button
                    style="display: block; font-size: 0.66rem"
                    color="danger"
                    @click="deleteAccount(account.id)"
                    size="small"
                  >
                    <ion-icon slot="start" :icon="trashBinOutline"></ion-icon>
                    Delete</ion-button
                  >
                </ion-content>
              </ion-popover>
            </div>
          </ion-card-header>

          <!-- Side-by-side layout applied here -->
          <ion-card-content class="otp-content-wrapper">
            <span class="otp-code">{{ formatCode(codes[account.id]) }}</span>
            <CircleCounter :counter="counters[account.id]" :size="45" />
          </ion-card-content>

          <ion-button @click="copyCode(codes[account.id])" fill="clear">
            <ion-icon slot="start" :icon="copyOutline"></ion-icon>
            Copy</ion-button
          >
        </ion-card>
      </template>
      <template v-else>
        <ion-item>
          <ion-label>No accounts found</ion-label>
          <ion-button @click="goToAddAccount">Add Account</ion-button>
        </ion-item>
        <ion-item style="font-size: 0.86rem">
          <ion-label> Or go to import accounts </ion-label>
          <ion-button @click="goToImportAccounts">Import</ion-button>
        </ion-item>
      </template>

      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
      <ion-toast
        position="top"
        :is-open="toastState"
        @didDismiss="toastState = false"
        message="Code copied to clipboard"
        :duration="1500"
      ></ion-toast>
    </ion-content>
    <ion-modal :is-open="qrViewModal" @did-dismiss="qrViewModalClosed">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="qrViewModal = false">Close</ion-button>
          </ion-buttons>
          <ion-title>View QR</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding"
        ><div
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          "
        >
          <span style="margin-bottom: 0.5rem">
            Scan the QR code below to add a new account to another 2FA app
          </span>
          <img style="margin-bottom: 0.5rem" :src="qrCodeImage" />
          <ion-button style="margin-bottom: 0.5rem" @click="downloadQr"
            >Download QR</ion-button
          >
          <ion-button style="margin-bottom: 0.5rem" @click="qrViewModal = false"
            >Close</ion-button
          >
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref, Ref, reactive } from "vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonItem,
  IonLabel,
  IonButton,
  onIonViewWillEnter,
  onIonViewDidLeave,
  IonModal,
  IonRadioGroup,
  IonRadio,
  IonButtons,
  IonList,
  IonListHeader,
  IonText,
  IonToast,
  IonIcon,
  IonAvatar,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonPopover,
} from "@ionic/vue";
import {
  getAccounts,
  copyText,
  getUrl,
  numToHexStr,
  openTab,
  getSettings,
  getVersion,
  deleteAccountById,
} from "@/utils/platform";
import type { Account } from "@/extension/types";
import router from "@/router";
import {
  copyOutline,
  addCircleOutline,
  ellipsisVertical,
  trashBinOutline,
  pencil,
  eyeOutline,
  downloadOutline,
} from "ionicons/icons";
import GitHub from "@/components/icons/GitHub.vue";
import SelectedAccountModal from "@/views/modals/SelectAccountModal.vue";
import GenericBlockChain from "@/components/icons/GenericBlockChain.vue";
import CircleCounter from "./components/CircleCounter.vue";
import { getRemainingTime } from "@otplib/totp";
import { generateOTP, createOTPProtocolString } from "@/utils/OTP";
import { QRImageData } from "@/utils/QR";
import { exportQRPng, removeUnsafeFilenameCharacters } from "@/utils/misc";

const version = getVersion();

const loading = ref(false);
const accounts = ref([]) as Ref<Account[]>;
const filtredAccounts = ref([]) as Ref<Account[]>;
const accountsModal = ref(false) as Ref<boolean>;
const qrViewModal = ref(false) as Ref<boolean>;
const qrViewModalId = ref(0) as Ref<number>;
const toastState = ref(false);
const qrCodeImage = ref("") as Ref<string>;
const settings = ref({}) as Ref<Awaited<ReturnType<typeof getSettings>>>;
const rpcPerformance = ref({ performance: 0 }) as Ref<{ performance: number }>;
const event = (ref(null) as unknown) as Ref<Event>;
let counters: { [key: string]: number };
let codes: { [key: string]: string };
let popovers: { [key: string]: boolean };
let timeInterval: ReturnType<typeof setInterval>;

const networkSearchBar = ref<InstanceType<typeof IonSearchbar> | null>(null);

const getToastRef = () => toastState;

const getRefs = () => {
  return {
    accountsModal,
    accounts,
  };
};

const copyCode = (code: string) => {
  copyText(code, getToastRef());
};

const closePopover = (id: number) => {
  popovers[id] = false;
};

const openPopover = (id: number, $event: Event) => {
  popovers[id] = true;
  event.value = $event;
};

const edit = (id: number) => {
  router.push("/tabs/add-account/edit/" + id);
  closePopover(id);
};

const view = async (id: number) => {
  const account = accounts.value.find((a) => a.id === id);
  if (!account) return;
  const data = await QRImageData(account);
  qrCodeImage.value = data.qr;
  qrViewModalId.value = id;
  qrViewModal.value = true;

  closePopover(id);
};

const download = async (id: number) => {
  const account = accounts.value.find((a) => a.id === id);
  closePopover(id);
  if (!account) return;
  const data = await QRImageData(account);
  exportQRPng(data.name, data.qr);
};

const downloadQr = () => {
  const account = accounts.value.find((a) => a.id === qrViewModalId.value);
  if (!account) return;
  const name = `${removeUnsafeFilenameCharacters(
    account.service
  )}-${removeUnsafeFilenameCharacters(account.account)}-OTP.png`;
  exportQRPng(name, qrCodeImage.value);
};

const qrViewModalClosed = () => {
  qrViewModal.value = false;
  qrCodeImage.value = "";
  qrViewModalId.value = 0;
};

const formatCode = (code: string) => {
  return code.replace(/(\d{3})(?=\d)/g, "$1 ");
};

const deleteAccount = async (id: number) => {
  loading.value = true;
  closePopover(id);
  await deleteAccountById(id);
  accounts.value = await getAccounts();
  loading.value = false;
};

// const loadRPCPerformance = () => {
//   rpcPerformance.value = { performance: 0 };
//   getRpcPerformance().then((res) => {
//     rpcPerformance.value = res;
//   });
// };

const searchAccount = (e: any) => {
  const text = e.target.value;

  if (text) {
    filtredAccounts.value = accounts.value.filter(
      (item) =>
        item.service.toLowerCase().includes(text.toLowerCase()) ||
        (item?.website || "").toLowerCase().includes(text.toLowerCase()) ||
        item.account.toLowerCase().includes(text.toLowerCase())
    );
  } else {
    filtredAccounts.value = accounts.value;
  }
};

const loadData = () => {
  loading.value = true;
  const pAccounts = getAccounts();
  // const pNetworks = getNetworks();
  // const pSelectedAccount = getSelectedAccount();
  // const pSelectedNetwork = getSelectedNetwork();
  // const pSettings = getSettings();
  Promise.all([pAccounts]).then((res) => {
    accounts.value = res[0];
    filtredAccounts.value = res[0];

    // networks.value = res[1];
    // filtredNetworks.value = res[1];
    // selectedAccount.value = res[2];
    // selectedNetwork.value = res[3];
    // settings.value = res[4];

    let countersObj = {} as { [id: number]: number };
    let codesObj = {} as { [id: number]: string };
    let popoversObj = {} as { [id: number]: boolean };

    accounts.value.forEach((a) => {
      countersObj[a.id] = 0;
      codesObj[a.id] = "";
      popoversObj[a.id] = false;
    });

    counters = reactive(countersObj);
    codes = reactive(codesObj);
    popovers = reactive(popoversObj);

    const calculateData = () => {
      accounts.value.forEach(async (a) => {
        const remainingTime = getRemainingTime();
        counters[a.id] = remainingTime;
        codes[a.id] = await generateOTP({
          secret: a.otpSecret,
        });
      });
    };

    calculateData();

    timeInterval = setInterval(() => {
      calculateData();
    }, 1000);

    loading.value = false;
  });
};

onIonViewWillEnter(() => {
  loadData();
});

onIonViewDidLeave(() => {
  clearInterval(timeInterval);
});

const goToAddAccount = () => {
  router.push("/tabs/add-account");
};

const goToImportAccounts = () => {
  router.push("/tabs/settings/import-export");
};
</script>

<style scoped>
ion-popover.otpmenu {
  --width: 120px;

  ion-content {
    --padding-top: 0.4rem;
    --padding-bottom: 0.4rem;
    --padding-start: 0.4rem;
    --padding-end: 0.4rem;
  }
}

.exchange-btn {
  height: 2rem;
  margin-top: 0.3rem;
  margin-left: auto;
  margin-right: auto;
  display: block;
  cursor: pointer;
}
.exchange-btn:hover {
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  transform: scale(1.05);
}

.github-icon {
  position: absolute;
  top: 0.9rem;
  right: 2.4rem;
  margin-left: 0.3rem;
  color: #aca3bb;
  font-weight: bold;
  font-size: 0.65rem;
  cursor: pointer;
}

.github-icon:hover {
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  transform: scale(1.05);
}

.link-docs {
  cursor: pointer;
}

.link-docs:hover {
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  transform: scale(1.05);
}

.otp-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.otp-code {
  font-size: 1.8rem;
  color: var(--ion-color-primary);
  letter-spacing: 1px;
  font-family: monospace; /* Optional: keeps numbers evenly spaced */
}
</style>
