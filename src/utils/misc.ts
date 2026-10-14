import JSZip from 'jszip'

export const exportFile = (fileName: string, content: Blob | string, type = 'text/json;charset=utf-8;') => {
    const link = document.createElement('a')
    const blob = new Blob([content], { type: `${type}` })
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Helper to convert base64 (or data URL) to a binary Blob
const base64ToBlob = (base64: string, type: string) => {
    // Strip the data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
}

export const exportQRPng = (fileName: string, content: string) => {
   const pngBlob = base64ToBlob(content, 'image/png');
    exportFile(fileName, pngBlob, 'image/png');
}

export const exportQRsToPngsZip = (fileNames: string[], contents: string[]) => {
    return new Promise((resolve, reject) => {

    const zip = new JSZip();
    for (let i = 0; i < fileNames.length; i++) {
        zip.file(`${fileNames[i]}.png`, base64ToBlob(contents[i], 'image/png'));
    }
    zip.generateAsync({ type: 'blob' }).then((blob) => {
        exportFile('export-2fa.zip', blob, 'application/zip');
    });
      resolve(true)
    })
}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


export const isValidDomain = (domain: string) => {
  try {
    new URL(domain)
    return true
  } catch (e) {
    return false
  }
}

export const extractDomainWthoutWww = (domain: string) => {
  const url = new URL(domain)
  return url.hostname.replace(/^www\./, '')
}

const cyrb64 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return [h2>>>0, h1>>>0];
};


function safeStringifyReplacer (seen: any) {
  return function (key: any, value: any) {
    if (typeof value?.toJSON === 'function') {
      value = value.toJSON()
    }

    if (!(value !== null && typeof value === 'object')) {
      return value
    }

    if (seen.has(value)) {
      return '[Circular]'
    }

    seen.add(value)

    const newValue: { [key: string]: any } = Array.isArray(value) ? [] : {}

    for (const [key2, value2] of Object.entries(value)) {
      newValue[key2] = safeStringifyReplacer(seen)(key2, value2)
    }

    seen.delete(value)

    return newValue
  }
}

export const stringify = (obj: any) => {
  const seen = new WeakSet()
  return JSON.stringify(obj, safeStringifyReplacer(seen), 2)
}

export const cyrb64Hash =  (str: string, seed = 0) => {
  const [h2, h1] = cyrb64(str, seed);
  return h2.toString(36).padStart(7, '0') + h1.toString(36).padStart(7, '0');
}

export const base64ToBase64Url = (base64:string) => {
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const removeUnsafeFilenameCharacters = (filename: string) => {
  return filename.replace(/[<>:"/\\|?*]/g, '');
}