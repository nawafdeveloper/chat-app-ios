import { Buffer } from '@craftzdog/react-native-buffer'
import {
    cacheDirectory,
    deleteAsync,
    EncodingType,
    writeAsStringAsync,
} from 'expo-file-system/legacy'
import { authClient } from './auth-client'
import { retrieveSessionKeys } from './crypto-storage'
import { decryptFileWithAes } from './decrypt-file'
import { encryptFileWithAes } from './encrypt-file'

const API_BASE = 'https://halabakk-web.nawaf-alhasosah.workers.dev'

// ─── Encrypt AES key with RSA public key ────────────────────────────────────

async function encryptAesKeyWithPublicKey(
    aesKeyBase64: string,
    publicKey: CryptoKey
): Promise<string> {
    const aesKeyBytes = Uint8Array.from(atob(aesKeyBase64), c => c.charCodeAt(0))

    const encrypted = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        aesKeyBytes
    )

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}

function getMimeTypeFromUri(uri: string): string {
    const ext = uri.split('.').pop()?.toLowerCase()
    const map: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        avif: 'image/avif',
    }
    return map[ext ?? ''] ?? 'image/jpeg'
}

// ─── Decrypt AES key with RSA private key ───────────────────────────────────

async function decryptAesKeyWithPrivateKey(
    encryptedAesKeyBase64: string,
    privateKey: CryptoKey
): Promise<string> {
    const encryptedBytes = Uint8Array.from(
        atob(encryptedAesKeyBase64),
        c => c.charCodeAt(0)
    )

    const decrypted = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedBytes
    )

    return btoa(String.fromCharCode(...new Uint8Array(decrypted)))
}

export interface ProfileImageUploadResult {
    imageUrl: string
    mediaId: string
}

export async function uploadEncryptedProfileImage(
    fileUri: string
): Promise<ProfileImageUploadResult> {
    const sessionKeys = await retrieveSessionKeys()
    if (!sessionKeys?.publicKey) {
        throw new Error('No public key found in session. Please log in again.')
    }

    const response = await fetch(fileUri)
    if (!response.ok) throw new Error('Failed to read image file')

    const buffer = await response.arrayBuffer()
    const fileBytes = new Uint8Array(buffer)

    const { encryptedData, aesKey, iv } = await encryptFileWithAes(fileBytes)
    const encryptedBuffer =
        encryptedData instanceof Uint8Array
            ? encryptedData
            : new Uint8Array(encryptedData as ArrayBuffer)

    const encryptedAesKey = await encryptAesKeyWithPublicKey(aesKey, sessionKeys.publicKey)

    const originalMimeType = getMimeTypeFromUri(fileUri)
    const ext = fileUri.split('.').pop()?.toLowerCase() ?? 'jpg'

    const tempUri = cacheDirectory + `encrypted_profile.${ext}`
    await writeAsStringAsync(
        tempUri,
        Buffer.from(encryptedBuffer).toString('base64'),
        { encoding: EncodingType.Base64 }
    )

    const formData = new FormData()
    formData.append('file', {
        uri: tempUri,
        name: `profile.${ext}`,
        type: originalMimeType,
    } as any)
    formData.append('aesKey', encryptedAesKey)
    formData.append('iv', iv)

    const cookies = authClient.getCookie();
    const headers = {
        "Cookie": cookies,
    };

    const uploadResponse = await fetch(`${API_BASE}/api/profile-image`, {
        method: 'POST',
        body: formData,
        headers,
        credentials: "omit"
    })

    await deleteAsync(tempUri, { idempotent: true })

    const text = await uploadResponse.text()
    if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${text}`)
    }

    return JSON.parse(text)
}

// ─── Fetch & Decrypt ─────────────────────────────────────────────────────────

export async function fetchAndDecryptProfileImage(objectKey: string): Promise<string> {
    const sessionKeys = await retrieveSessionKeys()
    if (!sessionKeys?.privateKey) {
        throw new Error('No private key found in session. Please log in again.')
    }

    // ✅ Add auth cookies to all requests
    const cookies = authClient.getCookie()
    const headers = { Cookie: cookies }

    // 2. Fetch the encrypted AES key from server
    const keyResponse = await fetch(
        `${API_BASE}/api/profile-image/key/${objectKey}`,
        { headers, credentials: 'omit' }  // ✅
    )
    if (!keyResponse.ok) throw new Error('Failed to fetch encryption key')

    const { aesKey: encryptedAesKeyBase64, iv, mimeType } = await keyResponse.json()

    // 3. Decrypt AES key with RSA private key
    const aesKey = await decryptAesKeyWithPrivateKey(
        encryptedAesKeyBase64,
        sessionKeys.privateKey
    )

    // 4. Fetch encrypted image
    const imageResponse = await fetch(
        `${API_BASE}/api/profile-image/${objectKey}`,
        { headers, credentials: 'omit' }  // ✅
    )
    if (!imageResponse.ok) throw new Error('Failed to fetch encrypted image')

    const encryptedData = await imageResponse.arrayBuffer()

    // 5. Decrypt image
    const decryptedBytes = await decryptFileWithAes(encryptedData, aesKey, iv)

    // 6. Write decrypted image to temp file and return local URI
    const tempUri = cacheDirectory + `decrypted_profile_${Date.now()}.jpg`
    await writeAsStringAsync(
        tempUri,
        Buffer.from(decryptedBytes).toString('base64'),
        { encoding: EncodingType.Base64 }
    )

    return tempUri
}