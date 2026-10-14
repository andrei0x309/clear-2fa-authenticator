import type { Account, Settings, } from '@/extension/types'
import type { Ref } from 'vue'

const defaultSettings = {
    enableStorageEnctyption: false,
    lockOutEnabled: false,
    lockOutPeriod: 2,
    lockOutBlocked: false,
    theme: 'system',
    lastLock: Date.now(),
    showMoreThanOneAccountWarning: true
} as Settings

export const CONTEXT_MENU_ID = 'c2fa-paste-otp'

export const storageSave = async (key: string, value: any): Promise<void> =>{
    await chrome.storage.local.set({ [key]: value })
}

export const storageGet = async (key: string): Promise<{ [key: string]: any }> => {
    return await chrome.storage.local.get(key)
}

export const sessionGet = async (key: string): Promise<{ [key: string]: any }> => {
    return await chrome.storage.session.get(key)
}

export const sessionSave = async (key: string, value: any): Promise<void> => {
    await chrome.storage.session.set({ [key]: value })
}

export const storageWipe = async (): Promise<void> => {
    await chrome.storage.local.clear()
}

export const isStorageClear = async (): Promise<boolean> => {
    return (await getAccounts()).length === 0
}

 

export const getAccounts = async (): Promise<Account[]> => {
    return (await storageGet('accounts')).accounts ?? [] as Account[]
}

export const saveAccount = async (account: Account): Promise<void> => {
    const savedAccounts = (await getAccounts()).filter((a: Account) => a.id !== account.id)
    await storageSave('accounts', [account, ...savedAccounts])
}

export const getLastIdAccounts = async (): Promise<number> => {
    return (await getAccounts()).reduce((acc, curr) => Math.max(acc, curr.id), 0)
}

export const getNextIdAccounts = async (): Promise<number> => {
    return 1 + (await getLastIdAccounts())
}

export const replaceAccounts = async (accounts: Account[]): Promise<void> => {
    await storageSave('accounts', accounts)
}

export const deleteAccountById = async (id: number): Promise<void> => {
    const savedAccounts = await getAccounts()
    await storageSave('accounts', savedAccounts.filter((account: Account) => account.id !== id))
}

export const getSelectedAccount = async (): Promise<Account> => {
    return (await storageGet('selectedAccount'))?.selectedAccount ?? null as unknown as Account
}


export const saveSelectedAccount = async (selectedAccount: Account): Promise<void> => {
    await storageSave('selectedAccount', selectedAccount )
}

 
 
export const getSettings = async (): Promise<Settings> => {
    const settings = (await storageGet('settings'))?.settings ?? defaultSettings as unknown as Settings
    return {
        ...defaultSettings,
        ...settings
    }
}

export const setSettings = async (settings: Settings): Promise<void> => {
    await storageSave('settings', settings )
}
 
export const blockLockout = async (): Promise<Settings> => {
    const settings = await getSettings()
    settings.lockOutBlocked = true
    await setSettings(settings)
    return settings
}

export const unBlockLockout = async (): Promise<Settings> => {
    const settings = await getSettings()
    settings.lockOutBlocked = false
    await setSettings(settings)
    return settings
}

export const getBalanceCache = async (): Promise<string> => {
    return (await storageGet('balance'))?.balance ?? '0x0'
}

export const smallRandomString = (size = 7) => {
    if(size <= 7) {
    return (Math.random() + 1).toString(36).substring(0,7);
    } else {
        let str = ''
        for(let i = 0; i < (size / 7) << 0; i++){
            str+=(Math.random() + i).toString(36).substring(0,7);
        }
        return str.substring(0, size)
    }
}

export const hexTostr = (hexStr: string) => {
    if (hexStr.substring(0, 2) !== '0x') {
       return hexStr
    }
    hexStr = hexStr.substring(2);
    const match = hexStr.match(/../g);
    const bytes = new Uint8Array(match ? match.map(h => Number.parseInt(h, 16)) : []);
    try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(bytes);
    } catch {
        const chunks = [];
        for (let i = 0, charsLength = hexStr.length; i < charsLength; i += 2) {
            chunks.push(hexStr.substring(i, i + 2));
        }
       return chunks.reduce(
       (pv, cv) => `${pv}${String.fromCharCode(Number.parseInt(cv, 16))}`,
               '')
       }
};

export const strToHex = (str: string) =>  `0x${str.split('').map( s => s.charCodeAt(0).toString(16)).join('')}`

export const numToHexStr = (num: number | bigint) => `0x${num.toString(16)}`

export const copyText = async (data: string, toastRef: Ref<boolean>) => {
    await navigator.clipboard.writeText(data)
    toastRef.value = true
}

export const getUrl = (url: string) => chrome.runtime.getURL(url)

export const paste = (id: string) => {
    const el = document.querySelector(`#${id} input.native-input`) as HTMLInputElement
    if(el){
      el.focus();
      (document as any)?.execCommand('paste')
    }
}

export const pasteTextArea = (id: string) => {
    const el = document.querySelector(`#${id} textarea`) as HTMLTextAreaElement
    if(el){
      el.focus();
      (document as any)?.execCommand('paste')
    }
}

export const enableRightClickPasteOTP = async () => {
    try {
        await chrome.contextMenus.removeAll();
        await chrome.contextMenus.create({
            id: CONTEXT_MENU_ID,
            title: "Paste OTP",
            contexts: ["editable"],
        });
    } catch (error) {
        // ignore
    }
}

export const pasteToFocused = () => {
    const el = document.activeElement as HTMLInputElement
    if(el){
      el?.focus();
      (document as any)?.execCommand('paste')
    }
}

export const openTab = (url: string) => {
    chrome.tabs.create({
        url
      });
}

export const getVersion = () => chrome?.runtime?.getManifest()?.version ?? ''

export const isFirefox = () => {
 return chrome?.runtime.getURL('').startsWith('moz-extension://')
}