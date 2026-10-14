<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-accordion-group :value="openedAccordion">
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label>Theme</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-list>
              <ion-radio-group :value="radioTheme">
                <ion-item @click="changeTheme('system')">
                  <ion-radio slot="start" value="system" />
                  <ion-label>System Default</ion-label>
                </ion-item>
                <ion-item @click="changeTheme('dark')">
                  <ion-radio slot="start" value="dark" />
                  <ion-label>Dark</ion-label>
                </ion-item>
                <ion-item @click="changeTheme('light')">
                  <ion-radio slot="start" value="light" />
                  <ion-label>Light</ion-label>
                </ion-item>
              </ion-radio-group>
            </ion-list>
          </div>
        </ion-accordion>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label>Misc</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-item class="no-inner-border">
              <ion-label
                >Show warning on past OTP using right click or shortcut if the website
                matches more than one account</ion-label
              >
              <ion-toggle
                aria-label="Show raw Data when sending Transaction"
                @ion-change="changeshowMoreThanOneAccountWarning"
                slot="end"
                :checked="settings.s?.showMoreThanOneAccountWarning"
              ></ion-toggle>
            </ion-item>
          </div>
        </ion-accordion>
        <ion-accordion v-if="!isRuntimeFirefox" value="import-export">
          <ion-item slot="header" color="light">
            <ion-label> Import / Export Accounts</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-item class="ion-no-padding no-inner-border">
              <input
                ref="importFile"
                type="file"
                accept=".json"
                class="file-input-cls"
                id="importFile"
                style="display: none"
              />
              <ion-label>Import Additional Accounts with a JSON File</ion-label>
              <ion-button color="warning" @click="importAcc">Import</ion-button>
            </ion-item>
            <ion-item class="ion-no-padding export-border">
              <ion-label>Export All Accounts to a JSON file</ion-label>
              <ion-button color="warning" @click="exportAcc">Export</ion-button>
            </ion-item>
            <ion-item class="ion-no-padding export-border">
              <ion-label>Export All Accounts as QR images in a ZIP file</ion-label>
              <ion-button color="warning" @click="exportAccountsAsQRImagesZipped"
                >Export</ion-button
              >
            </ion-item>
          </div>
        </ion-accordion>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label>Danger</ion-label>
          </ion-item>
          <div class="ion-padding" slot="content">
            <ion-item>
              <ion-label>Clear All Data</ion-label>
              <ion-button color="danger" @click="wipeStorage"
                >Remove all stored data</ion-button
              >
            </ion-item>
          </div>
        </ion-accordion>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-label>About</ion-label>
          </ion-item>
          <About />
        </ion-accordion>
      </ion-accordion-group>
      <ion-toast
        position="top"
        :is-open="toastState"
        @didDismiss="toastState = false"
        :message="toastMsg"
        :duration="1500"
      ></ion-toast>
      <ion-loading
        :is-open="loading"
        cssClass="my-custom-class"
        message="Please wait..."
        :key="`k${loading}`"
        @didDismiss="loading = false"
      >
      </ion-loading>
      <ion-loading
        :is-open="loadingExportImagesArchive"
        cssClass="my-custom-class"
        :message="progressImageExportMsg"
        :key="`k-ie${loadingExportImagesArchive}`"
        @didDismiss="loadingExportImagesArchive = false"
      >
      </ion-loading>
      <ion-modal
        :is-open="mpModal"
        @did-dismiss="
          mpModal = false;
          modalDismiss();
        "
      >
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button
                @click="
                  modalGetPassword?.reject
                    ? (() => {
                        modalGetPassword.reject();
                        modalGetPassword = null;
                      })()
                    : (() => {
                        mpModal = false;
                        mpModalEnctyption = settings.s.enableStorageEnctyption;
                      })()
                "
                >Close</ion-button
              >
            </ion-buttons>
            <ion-title v-if="!settings.s.enableStorageEnctyption"
              >Create Encryption Password</ion-title
            >
            <ion-title v-else>Enter Encryption Password</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <template v-if="settings.s.enableStorageEnctyption">
            <ion-item>
              <ion-label
                >Password
                <span class="helper-label"
                  >(Required: was set before by user)
                </span></ion-label
              >
            </ion-item>
            <ion-item>
              <ion-input
                aria-label="password"
                v-model="mpPass"
                type="password"
                fill="outline"
              ></ion-input>
            </ion-item>
          </template>
          <template v-else>
            <ion-item>
              <ion-label>New Password</ion-label>
            </ion-item>
            <ion-item>
              <ion-input
                aria-label="password"
                v-model="mpPass"
                type="password"
                fill="outline"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Confirm New Password</ion-label>
            </ion-item>
            <ion-item>
              <ion-input
                aria-label="password"
                v-model="mpConfirm"
                type="password"
                fill="outline"
              ></ion-input>
            </ion-item>
          </template>
          <ion-item>
            <ion-button
              @click="
                () => {
                  /*
                modalGetPassword?.resolve
                  ? (() => {
                      modalGetPassword.resolve();
                      modalGetPassword = null;
                    })()
                  : confirmModal()
                  */
                }
              "
              >Confirm</ion-button
            >
          </ion-item>
        </ion-content>
      </ion-modal>
      <ion-alert
        :is-open="alertOpen"
        :header="alertHeader"
        :message="alertMsg"
        :buttons="['OK']"
        @didDismiss="alertOpen = false"
      ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref, reactive, Ref } from "vue";
import {
  storageWipe,
  isStorageClear,
  getSettings,
  setSettings,
  getAccounts,
  saveSelectedAccount,
  replaceAccounts,
  openTab,
  isFirefox,
  getNextIdAccounts,
} from "@/utils/platform";
import { decrypt, encrypt, getCryptoParams } from "@/utils/webCrypto";
import { Account, KeyOfType } from "@/extension/types";
import { exportFile, exportQRsToPngsZip } from "@/utils/misc";
import type { Accounts, Settings } from "@/extension/types";
import type { IonTextareaCustomEvent, TextareaInputEventDetail } from "@ionic/core";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonLoading,
  onIonViewWillEnter,
  IonList,
  IonToggle,
  IonModal,
  IonInput,
  IonTextarea,
  IonAccordion,
  IonAccordionGroup,
  IonRadioGroup,
  IonRadio,
  IonButtons,
  IonAlert,
  IonToast,
} from "@ionic/vue";
import About from "./components/settings/About.vue";
import { QRImageData } from "@/utils/QR";
import { useRoute } from "vue-router";

const route = useRoute();
const loading = ref(true);
const loadingExportImagesArchive = ref(false);
const progressImageExportMsg = ref("");
const mpModal = ref(false);
const mpModalEnctyption = ref(false);
const mpPass = ref("");
const mpConfirm = ref("");
const alertOpen = ref(false);
const alertMsg = ref("");
const toastState = ref(false);
const toastMsg = ref("");
const alertHeader = ref("Error");
const lockOutPeriod = defineModel({ default: 2 as number });
const setEncryptToggleKey = ref(0);
const importFile = (ref(null) as unknown) as Ref<HTMLInputElement>;
const isRuntimeFirefox = ref(false);
const openedAccordion = ref("") as Ref<string>;

type ModalPromisePassword = null | {
  resolve: (p?: unknown) => void;
  reject: (p?: unknown) => void;
};
const modalGetPassword = ref(null) as Ref<ModalPromisePassword>;
const noAccounts = ref(true);
const radioTheme = ref("system") as Ref<"system" | "light" | "dark">;

const wipeStorage = async () => {
  loading.value = true;
  if (await isStorageClear()) {
    toastMsg.value = "Storage is already empty";
    toastState.value = true;
    loading.value = false;
    return;
  }

  await storageWipe();

  toastMsg.value = "Storage was cleared";
  toastState.value = true;

  loading.value = false;
};

const settings = reactive({
  s: (null as unknown) as Settings,
}) as { s: Settings };

const saveSettings = async () => {
  loading.value = true;
  await setSettings({ ...settings.s });
  loading.value = false;
};

const setEncryptToggle = (state: boolean) => {
  setEncryptToggleKey.value++;
  settings.s.enableStorageEnctyption = state;
};

const changeAutoLock = async () => {
  settings.s.lockOutEnabled = !settings.s.lockOutEnabled;
  await saveSettings();
};

const changeshowMoreThanOneAccountWarning = async () => {
  settings.s.showMoreThanOneAccountWarning = !settings.s.showMoreThanOneAccountWarning;
  await saveSettings();
};

const changeTheme = async (theme: "system" | "light" | "dark") => {
  document.body.classList.remove(radioTheme.value);
  document.body.classList.add(theme);
  radioTheme.value = theme;
  settings.s.theme = theme;
  await saveSettings();
};

const changeEncryption = async () => {
  loading.value = true;
  mpModal.value = true;
  loading.value = false;
};

// const confirmModal = async () => {
//   if (mpPass.value.length < 3) {
//     loading.value = false;
//     alertHeader.value = "Error";
//     alertMsg.value = "Password is too short. More than 3 characters are required.";
//     alertOpen.value = true;
//     mpModalEnctyption.value = settings.s.enableStorageEnctyption;
//     return;
//   }

//   if (!settings.s.enableStorageEnctyption) {
//     if (mpPass.value !== mpConfirm.value) {
//       loading.value = false;
//       alertHeader.value = "Error";
//       alertMsg.value = "Password and confirm password do not match";
//       alertOpen.value = true;
//       mpModalEnctyption.value = settings.s.enableStorageEnctyption;
//       return;
//     }
//     let accounts = await getAccounts();
//     const cryptoParams = await getCryptoParams(mpPass.value);
//     const accProm = accounts.map(async (a) => {
//       a.encPk = await encrypt(a.pk, cryptoParams);
//       a.pk = "";
//       return a;
//     });
//     accounts = await Promise.all(accProm);
//     await replaceAccounts(accounts);
//     await saveSelectedAccount(accounts[0]);
//     mpModalEnctyption.value = true;
//     await setSettings({ ...settings.s, enableStorageEnctyption: true });
//     mpPass.value = "";
//     mpConfirm.value = "";
//     mpModal.value = false;
//   } else {
//     try {
//       let accounts = await getAccounts();
//       const cryptoParams = await getCryptoParams(mpPass.value);
//       const accProm = accounts.map(async (a) => {
//         if (a.encPk) {
//           a.pk = await decrypt(a.encPk, cryptoParams);
//         }
//         return a;
//       });
//       accounts = await Promise.all(accProm);
//       await replaceAccounts(accounts);
//       await saveSelectedAccount(accounts[0]);
//       mpModalEnctyption.value = false;
//       settings.s.enableStorageEnctyption = false;
//       settings.s.lockOutEnabled = false;
//       settings.s.encryptAfterEveryTx = false;
//       await setSettings({ ...settings.s });
//       mpPass.value = "";
//       mpConfirm.value = "";
//       mpModal.value = false;
//     } catch (error) {
//       loading.value = false;
//       alertHeader.value = "Error";
//       alertMsg.value = "Decryption failed, password is not correct.";
//       alertOpen.value = true;
//       mpModalEnctyption.value = settings.s.enableStorageEnctyption;
//       return;
//     }
//   }

//   loading.value = false;
// };

const allowerdJSONFields = [
  "service",
  "otpSecret",
  "encOtpSecret",
  "account",
  "website",
  "algorithm",
  "digits",
  "period",
  "id",
] as const;

const validateFile = () => {
  return new Promise(async (resolve) => {
    try {
      importFile.value.click();
      await new Promise((resolve) => {
        importFile.value.addEventListener("change", () => {
          resolve("");
        });
      });

      if (!importFile.value?.value?.length) {
        return resolve({
          error: "Import json file is missing",
        });
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = JSON.parse(event?.target?.result as string);
        if (!json.length) {
          return resolve({
            error:
              'JSON format is wrong. Corrrect JSON format is: [{"service": "Google", "otpSecret": "F2ABAF21A2", "account": "example@gmail.com"}...]',
          });
        }
        const testNecesaryFields = json.some(
          (e: any) => !("service" in e) || !("otpSecret" in e) || !("account" in e)
        );
        if (testNecesaryFields) {
          return resolve({
            error: `JSON format is wrong. Corrrect JSON format is: [{"service": "Google", "otpSecret": "F2ABAF21A2", "account": "example@gmail.com"}...]'`,
          });
        }

        let hasDisallowedFields = false;

        for (let i = 0; i < json.length; i++) {
          const keys = Object.keys(json[i]);

          for (let j = 0; j < keys.length; j++) {
            if (
              !allowerdJSONFields.includes(keys[j] as typeof allowerdJSONFields[number])
            ) {
              hasDisallowedFields = true;
              break;
            }
          }
        }

        if (hasDisallowedFields) {
          return resolve({
            error: `JSON format contains disallowed fields. Allowed fields are: ${allowerdJSONFields.join(
              ", "
            )}`,
          });
        }

        return resolve({ error: false, json });
      };
      reader.readAsText(importFile.value?.files?.[0] as File);
    } catch {
      return resolve({
        error: "Parsing JSON file",
      });
    }
  });
};

const getPassword = () => {
  return new Promise((resolve, reject) => {
    modalGetPassword.value = { resolve, reject };
    mpModal.value = true;
  });
};

// const promptForPassword = async (accounts: Account[]) => {
//   let isCorectPass = false;
//   do {
//     try {
//       await getPassword();
//       modalGetPassword.value = null;
//     } catch {
//       alertHeader.value = "Error";
//       alertMsg.value = "Password is required!";
//       alertOpen.value = true;
//       mpModal.value = false;
//       return false;
//     }
//     try {
//       const cryptoParams = await getCryptoParams(mpPass.value);
//       if (accounts?.[0]?.encPk) {
//         await decrypt(accounts[0].encPk, cryptoParams);
//       }
//       isCorectPass = true;
//     } catch {
//       isCorectPass = false;
//       alertHeader.value = "Error";
//       alertMsg.value = "Password is wrong!";
//       alertOpen.value = true;
//     }
//   } while (!isCorectPass);
//   return true;
// };

const importAcc = async () => {
  const validation = (await validateFile()) as { error: any };
  if (validation.error) {
    alertMsg.value = validation.error;
    alertOpen.value = true;
    return;
  }
  const accounts = await getAccounts();
  const newAccounts = ((validation as unknown) as { json: Account[] }).json;
  let lastId = await getNextIdAccounts();

  for (let i = 0; i < newAccounts.length; i++) {
    newAccounts[i].id = lastId++;
  }

  await replaceAccounts([...accounts, ...newAccounts]);
  alertHeader.value = "Success";
  alertMsg.value = "Successfully imported new accounts.";
  alertOpen.value = true;
  noAccounts.value = false;
  mpModal.value = false;
};

const exportAcc = async () => {
  const accounts = await getAccounts();
  if (!accounts.length) {
    alertMsg.value = "You need at least one account to export.";
    alertOpen.value = true;
    return;
  }

  exportFile("2fa_accounts_export.json", JSON.stringify(accounts, null, 2));
};

const exportAccountsAsQRImagesZipped = async () => {
  const accounts = await getAccounts();
  if (!accounts.length) {
    alertMsg.value = "You need at least one account to export.";
    alertOpen.value = true;
    return;
  }

  loadingExportImagesArchive.value = true;
  let progress = 1;
  const names = [] as string[];
  const contents = [] as string[];

  await new Promise((resolve, reject) => {
    accounts.forEach(async (account) => {
      const data = await QRImageData(account);
      names.push(data.name);
      contents.push(data.qr);
      progress++;

      progressImageExportMsg.value = `Exporting account ${progress} of ${accounts.length}`;

      if (progress === accounts.length) {
        resolve(true);
      }
    });
  });

  exportQRsToPngsZip(names, contents);

  loadingExportImagesArchive.value = false;
  progressImageExportMsg.value = "";
};

onIonViewWillEnter(async () => {
  isRuntimeFirefox.value = isFirefox();

  openedAccordion.value = route.params.oppenedAccordion as string;
  console.log("openedAccordion", openedAccordion.value);

  await Promise.all([
    getSettings().then((storeSettings) => {
      settings.s = storeSettings;
      lockOutPeriod.value = settings.s.lockOutPeriod;
      radioTheme.value = settings.s.theme;
    }),
    getAccounts().then((accounts) => {
      if (accounts.length) {
        noAccounts.value = false;
      }
    }),
  ]);
  loading.value = false;
});

const setTime = async () => {
  loading.value = true;
  if (lockOutPeriod.value < 2 || lockOutPeriod.value > 120) {
    loading.value = false;
    alertMsg.value = "Auto-lock period must be between 2 and 120";
    alertOpen.value = true;
    return;
  }
  settings.s.lockOutPeriod = Math.trunc(lockOutPeriod.value);
  await saveSettings();
  loading.value = false;
  toastMsg.value = "Auto-lock period was set";
  toastState.value = true;
};

const modalDismiss = () => {
  setEncryptToggle(mpModalEnctyption.value);
};
</script>

<style lang="css" scoped>
.helper-label {
  font-size: 0.82rem;
  opacity: 0.85;
  margin: -0.1rem 0 0.6rem 0;
}

.dark .file-input-cls {
  cursor: pointer;
  background-color: #222428;
}
.file-input-cls {
  cursor: pointer;
  background-color: var(--ion-background-color);
}

.dark .export-border {
  border-top: 1px solid #222;
}
.export-border {
  border-top: 1px solid #eee;
}

native-input sc-ion-input-md-h {
  padding-left: 0.4rem;
}
</style>
