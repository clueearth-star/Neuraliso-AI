import { decrypt } from "../../src/lib/crypto.js";

// GCM-encrypted secret payloads. These are ciphertext, not the real keys —
// decrypt() needs MASTER_ENCRYPTION_KEY (set as a Vercel env var) to unlock them.
const ENC_NVIDIA_KEY =
  "496129095dde390966ff040e:453aab76829bbd9dbff258a673775edf:c4a502d5dc6d3cf245e6c0b334a37a6f0352d9c34e64921a48d52f2bc3ef52b25886855f24238d756bace2e00b5868d8aaa95a0a7eb7e460fb30116700fcb1215e04fb9c7f4e";
const ENC_OPENROUTER_KEY =
  "d08cd6d46770148467c1eb13:8fe6025b59de31ba425f7ecc0459d20b:199cda6916fda375fac2b374e8ffd1f921b3a06ca2740ac3546e40fe35a7ae9ee01eb21c6e9061ec6d930083a2435911533ba77a2a6aa6c037dcc104426a4c8e75739a429b2bc8f6ca";
const ENC_SUPABASE_KEY =
  "713c9d67e3597db63cf5f271:42ca6bb4fc6f3c0fbe7ae05db531db13:2a79d4e185a33090cc9d9b9cfd9f4e51dfc28f15a7af3192d630f3a85520eef7d74bad829d6932cb6dd70a4e156046326dd62400258986fbb9f2f47d71791bb8436203f382c4cba6c7b657ac061c303f2d68228486ce430173ca422265a648ca4da3989d84e2e93944d2f4ae88ea201d9f72ff92f076d58f5102fc52cd08d56fded9523e476f0c3b60bbb4c1f1269d25513266f8eb13d44ea8d7994108806e5046b7a0c6884d18a537b3873cc60930e9c52253b7b4806bd3c9fea192899ece3f0c0323130b024da803012dff4f5260879b62157c0bf1ea9e8dd844";

let resolvedNvidiaKey = "";
let resolvedOpenRouterKey = "";
let resolvedSupabaseKey = "";
let initialized = false;

/**
 * Lazily decrypts secrets on first use within a warm serverless instance.
 * Vercel functions are stateless between cold starts, so this re-runs
 * whenever a new instance spins up — that's expected and fine.
 */
function ensureKeysResolved() {
  if (initialized) return;
  initialized = true;
  try {
    resolvedNvidiaKey = decrypt(ENC_NVIDIA_KEY);
    resolvedOpenRouterKey = decrypt(ENC_OPENROUTER_KEY);
    resolvedSupabaseKey = decrypt(ENC_SUPABASE_KEY);
    console.log("[Crypto GCM] Successfully decrypted server API keys.");
  } catch (err: any) {
    console.error(
      "[Crypto GCM] Failed to decrypt server API keys. Check MASTER_ENCRYPTION_KEY env var:",
      err.message || err
    );
  }
}

export function getResolvedKeys() {
  ensureKeysResolved();
  return { resolvedNvidiaKey, resolvedOpenRouterKey, resolvedSupabaseKey };
}

/**
 * Resolves which AI provider key to use, preferring explicit env vars
 * over the encrypted fallback keys.
 *
 * NOTE: the previous version of this file had a hardcoded plaintext
 * OpenRouter key as a last-resort fallback. That key was exposed in a
 * public GitHub repo and MUST be rotated in the OpenRouter dashboard.
 * It has been removed here — if no key is configured, this now throws
 * instead of silently using a compromised key.
 */
export function getApiKey(): string {
  const { resolvedNvidiaKey, resolvedOpenRouterKey } = getResolvedKeys();

  if (
    process.env.NVIDIA_API_KEY &&
    process.env.NVIDIA_API_KEY.trim() !== "" &&
    process.env.NVIDIA_API_KEY !== "YOUR_NVIDIA_API_KEY"
  ) {
    return process.env.NVIDIA_API_KEY.trim();
  }
  if (resolvedNvidiaKey && resolvedNvidiaKey.startsWith("nvapi-")) {
    return resolvedNvidiaKey;
  }
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== "" &&
    process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
    process.env.GEMINI_API_KEY !== "MOCK_KEY" &&
    !process.env.GEMINI_API_KEY.includes(resolvedOpenRouterKey)
  ) {
    return process.env.GEMINI_API_KEY.trim();
  }
  if (resolvedOpenRouterKey) {
    return resolvedOpenRouterKey;
  }

  throw new Error(
    "No AI provider API key configured (NVIDIA_API_KEY, GEMINI_API_KEY, or decrypted OpenRouter key)."
  );
}
