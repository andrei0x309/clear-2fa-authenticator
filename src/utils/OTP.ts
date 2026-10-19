import { generate, } from "@otplib/totp";
import { crypto } from  "@otplib/plugin-crypto-web"

type OtpSecretEncoding = 'hex' | 'base32' | 'base64' | 'raw';

interface DecodedOtpSecret {
  bytes: Uint8Array;
  encoding: OtpSecretEncoding;
  cleaned: string;
  hasOTPAuthData: boolean
  otpauthData?: Record<string, string | undefined | number>
}

interface ArgsCreateOTPProtocolString {
  service: string;
  account: string;
  issuer?: string;
  website?: string;
  secret: string;
  algorithm?: 'sha1' | 'sha256' | 'sha512';
  digits?: 6 | 8;
  period?: number;
}

interface ArgsGenerateOTP {
  secret: string;
  algorithm?: 'sha1' | 'sha256' | 'sha512';
  digits?: 6 | 8;
  period?: number;
}

const defaultCreateOTPProtocolStringArgs: ArgsCreateOTPProtocolString = {
  service: '',
  account: '',
  issuer: '',
  website: '',
  secret: '',
  algorithm: 'sha1',
  digits: 6,
  period: 30,
}

const defaultGenerateOTPArgs: ArgsGenerateOTP = {
  secret: '',
  algorithm: 'sha1',
  digits: 6,
  period: 30,
}

/**
 * Sanitizes, detects encoding, and decodes an OTP secret into a Uint8Array.
 */
export function decodeOtpSecret(secret: string): DecodedOtpSecret {
  if (typeof secret !== 'string') {
    throw new Error('Secret must be a string');
  }

  secret = secret.trim();
  let hasOTPAuthData = false

  const otpauthData = {
    service: '',
    account: '',
    website: '',
    secret: '',
    issuer: '',
    algorithm: 'sha1',
    digit: 6,
    period: 30,
  }

  // 1. Handle otpauth:// URIs by extracting the 'secret' query parameter
  if (secret.startsWith('otpauth://')) {
    try {
      const url = new URL(secret);
      const secretParam = url.searchParams.get('secret');
      const issuerParam = url.searchParams.get('issuer');
      const websiteParam = url.searchParams.get('website');

      if (issuerParam) {
        otpauthData.issuer = issuerParam
        if(issuerParam.includes('.')) {
          otpauthData.website = issuerParam
        }
      }

      if (websiteParam) {
        otpauthData.website = websiteParam
      }


      if (secretParam) {
        secret = secretParam;
        otpauthData.secret = secretParam;
      }

      const serviceAndAccount = url.pathname.slice(1).split(':');
      if (serviceAndAccount.length === 2) {
        otpauthData.service = decodeURIComponent(serviceAndAccount[0]);
        otpauthData.account = decodeURIComponent(serviceAndAccount[1]);
      }

    } catch {
      // Fallback regex if URL parsing fails for custom protocols in certain runtimes
      const match = secret.match(/[?&]secret=([^&]+)/i);
      if (match) {
        secret = decodeURIComponent(match[1]);
      }
    }

    hasOTPAuthData = true
  }

  // 2. Sanitize: Remove all internal whitespace, dashes, and invisible characters
  let cleaned = secret.replace(/[\s\-_]+/g, '');

  if (cleaned.length === 0) {
    throw new Error('Secret cannot be empty');
  }

  // --- Detection & Decoding ---

  // 3. Hexadecimal Check (Must be even length, 0-9, A-F)
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (cleaned.length % 2 === 0 && hexRegex.test(cleaned)) {
    return {
      bytes: decodeHex(cleaned),
      encoding: 'hex',
      cleaned,
      hasOTPAuthData,
      otpauthData
    };
  }

  // 4. Base32 Check (RFC 4648: A-Z, 2-7, optional '=' padding)
  const base32Cleaned = cleaned.toUpperCase();
  const base32Regex = /^[A-Z2-7]+=*$/;
  
  if (base32Regex.test(base32Cleaned)) {
    return {
      bytes: decodeBase32(base32Cleaned),
      encoding: 'base32',
      cleaned: base32Cleaned,
      hasOTPAuthData,
      otpauthData
    };
  }

  // 5. Base64 Check (A-Z, a-z, 0-9, +, /, optional '=' padding)
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (cleaned.length % 4 === 0 && base64Regex.test(cleaned)) {
    return {
      bytes: decodeBase64(cleaned),
      encoding: 'base64',
      cleaned,
      hasOTPAuthData,
      otpauthData
    };
  }

  // 6. Fallback: Raw UTF-8 String
  return {
    bytes: new TextEncoder().encode(secret),
    encoding: 'raw',
    cleaned: secret,
    hasOTPAuthData,
    otpauthData
  };
}

function decodeHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function decodeBase32(b32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const unpadded = b32.replace(/=+$/, '');
  
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < unpadded.length; i++) {
    const idx = alphabet.indexOf(unpadded[i]);
    if (idx === -1) throw new Error(`Invalid Base32 character: ${unpadded[i]}`);
    
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

function decodeBase64(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}


export const generateOTP = async (options: ArgsGenerateOTP ) =>  {
   const { secret, algorithm, digits, period } = {
    ...defaultGenerateOTPArgs,
    ...options
   }

    return await generate({
        secret:(decodeOtpSecret(secret)).bytes,
        digits: digits,
        period: period,
        algorithm,
        crypto,
        guardrails: {
          MAX_SECRET_BYTES: 1024,
          MAX_COUNTER: Number.MAX_SAFE_INTEGER,
          MAX_PERIOD: 3600,
          MAX_WINDOW: 99,
          MIN_PERIOD: 1,
          MIN_SECRET_BYTES: 10
        }
    })
}

export const createOTPProtocolString = (options: ArgsCreateOTPProtocolString) => {
  const  {
    service,
    account,
    secret,
    website,
    algorithm,
    digits,
    period
  } = {
    ...defaultCreateOTPProtocolStringArgs,
    ...options}
  return `otpauth://totp/${service}:${account}?secret=${secret}&issuer=${website || service}&algorithm=${algorithm}&digits=${digits}&period=${period}&website=${website}`
}
