
export type KeyOfType<Type, ValueType> = keyof {
  [Key in keyof Type as Type[Key] extends ValueType ? Key : never]: any;
};
export interface Account {
    id: number
    otpSecret: string
    encOtpSecret?: string
    service: string
    account: string
    website?: string
    algorithm?: 'sha1' | 'sha256' | 'sha512'
    digits?: 6 | 8
    period?: number
}

export interface Accounts {
    [key: string]: Account
}

export interface Settings {
    enableStorageEnctyption: boolean
    lockOutPeriod: number
    lockOutEnabled: boolean
    theme: 'system' | 'light' | 'dark'
    lastLock: number
    lockOutBlocked: boolean
    showMoreThanOneAccountWarning: boolean
}
