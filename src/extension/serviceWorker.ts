import {
    getSettings,
    getUrl,
    enableRightClickPasteOTP,
    getAccounts
} from '@/utils/platform';
 
import { generateOTP } from '@/utils/OTP';

const otpNotFoundForThisWebsite = (url: string) => {
                                chrome.notifications.create({
                                message: `OTP not found for this website ${url}, you don't have an account matching this url.`,
                                title: 'Warning',
                                iconUrl: getUrl('assets/extension-icon/app_128.png'),
                                type: 'basic'
                            } as any)
}

const noAccountsFound = () => {
                                chrome.notifications.create({
                                message: 'No accounts found please add at least one account to access this feature.',
                                title: 'Warning',
                                iconUrl: getUrl('assets/extension-icon/app_128.png'),
                                type: 'basic'
                            } as any)
}

const moreThanOneAccount = () => {
                                chrome.notifications.create({
                                message: 'More than one account has been found for this website, the first one will be used, you can diable this warning in settings.',
                                title: 'Warning',
                                iconUrl: getUrl('assets/extension-icon/app_128.png'),
                                type: 'basic'
                            } as any)
}

 
 
chrome.runtime.onInstalled.addListener(() => {
    enableRightClickPasteOTP();
    console.info('Service worker installed version', chrome.runtime.getManifest().version);
    if (chrome.runtime.lastError) {
        console.warn("Whoops.. " + chrome.runtime.lastError.message);
    }
})

chrome.runtime.onStartup.addListener(() => {
    console.info('Service worker startup');
    enableRightClickPasteOTP();
    if (chrome.runtime.lastError) {
        console.warn("Whoops.. " + chrome.runtime.lastError.message);
    }
})

chrome.runtime.onSuspend.addListener(() => {
    console.info('Service worker suspend');
    if (chrome.runtime.lastError) {
        console.warn("Whoops.. " + chrome.runtime.lastError.message);
    }
})


async function pasteOTP (code: string) {
        document.execCommand("insertText", false, code);
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
        input.value = code;
    }
}

async function doPasteCode (tab: chrome.tabs.Tab) {

      if (tab?.id) {

        const accounts = await getAccounts()
        if (accounts.length < 1) {
            noAccountsFound()
            return
        }

        const url = tab.url
      
        const foundAccounts = accounts.filter((a) => url?.includes(a.website ?? '') && (a?.website?.length || 0) > 0)

        if(foundAccounts.length < 1) {
            otpNotFoundForThisWebsite(url ?? '')
            return
        }

        if( foundAccounts.length > 1) {
            const settings = await getSettings()
            if (settings.showMoreThanOneAccountWarning) {
                 moreThanOneAccount()
            }
        }
 

            const code = await generateOTP({
                secret: foundAccounts[0].otpSecret
            })
             
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                world: 'MAIN',
                args: [code],
                func: pasteOTP
            });
        }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (tab?.id) {
        await doPasteCode(tab)
    }
})

chrome.alarms.create('updatePrices', {
    periodInMinutes: 1
})

chrome.alarms.create('checkCurrentRpc', {
    periodInMinutes: 5
})

 

chrome.windows.onRemoved.addListener(async (winId) => {
 
})

chrome.runtime.onMessage.addListener(
     () => {
             return true;
     }
);


chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "insert-totp") {
    if(tab?.id) {
        doPasteCode(tab)
    }
  }
});