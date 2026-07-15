import crypto from "crypto";

/**
 * Derives a 32-byte (256-bit) cryptographically strong key from the master string
 * using the SHA-256 hashing algorithm.
 */
function getEncryptionKey(masterKeyString: string): Buffer {
  return crypto.createHash("sha256").update(masterKeyString).digest();
}

/**
 * Standard secure fallback master key for development environments.
 * Users are strongly encouraged to override this by defining MASTER_ENCRYPTION_KEY
 * in their environment secrets / .env configuration.
 */
const DEFAULT_MASTER_KEY = "73a236e4ec3774c1b9974f323de43bbe25b1b22531b4e8c2b4e205ce1e5c3604";

/**
 * Resolves the master key from environment variables, falling back to the 
 * secure default key if none is supplied.
 */
export function getMasterKey(): string {
  const envKey = process.env.MASTER_ENCRYPTION_KEY;
  if (envKey && envKey.trim() !== "") {
    return envKey.trim();
  }
  return DEFAULT_MASTER_KEY;
}

/**
 * Encrypts cleartext using AES-256-GCM.
 * Returns a colon-separated string: "iv_hex:tag_hex:ciphertext_hex"
 */
export function encrypt(text: string, masterKey: string = getMasterKey()): string {
  const iv = crypto.randomBytes(12); // GCM standard IV is 12 bytes
  const key = getEncryptionKey(masterKey);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const tag = cipher.getAuthTag().toString("hex");
  
  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

/**
 * Decrypts a colon-separated "iv_hex:tag_hex:ciphertext_hex" string using AES-256-GCM.
 * Safely verifies integrity using the GCM authentication tag.
 */
export function decrypt(encryptedText: string, masterKey: string = getMasterKey()): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format. Expected format: iv:tag:ciphertext");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = Buffer.from(parts[2], "hex");
  
  try {
    const key = getEncryptionKey(masterKey);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, "hex" as any, "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    // If decryption fails and we used a non-default masterKey, fall back to DEFAULT_MASTER_KEY
    if (masterKey !== DEFAULT_MASTER_KEY) {
      try {
        const key = getEncryptionKey(DEFAULT_MASTER_KEY);
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted, "hex" as any, "utf8");
        decrypted += decipher.final("utf8");
        
        return decrypted;
      } catch (fallbackErr) {
        throw err; // throw original error if fallback also fails
      }
    }
    throw err;
  }
}

/**
 * Utility to decrypt if the input looks encrypted (colon-separated 3 parts),
 * otherwise returns the input as-is. Handy for transition periods or hybrid configurations.
 */
export function safeDecrypt(value: string | undefined, masterKey: string = getMasterKey()): string {
  if (!value) return "";
  if (value.split(":").length === 3) {
    try {
      return decrypt(value, masterKey);
    } catch (e) {
      console.error("[Crypto GCM] Failed to decrypt value. Returning as plaintext fallback.");
      return value;
    }
  }
  return value;
}
