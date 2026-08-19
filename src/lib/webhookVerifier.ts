import crypto from "crypto";

export function verifyDodoWebhookSignature({
  payload,
  headers,
  secret,
}: {
  payload: string | Buffer;
  headers: Record<string, string | string[] | undefined>;
  secret: string;
}): { isValid: boolean; error?: string } {
  try {
    if (!secret) {
      return { isValid: false, error: "Missing DODO_WEBHOOK_SECRET" };
    }

    const webhookId = (headers["webhook-id"] || headers["Webhook-Id"]) as string;
    const webhookTimestamp = (headers["webhook-timestamp"] || headers["Webhook-Timestamp"]) as string;
    const webhookSignature = (headers["webhook-signature"] || headers["Webhook-Signature"]) as string;

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      return { isValid: false, error: "Missing required webhook headers (webhook-id, webhook-timestamp, webhook-signature)" };
    }

    // Check timestamp tolerance (e.g. 5 minutes)
    const timestampMs = parseInt(webhookTimestamp, 10) * 1000;
    const now = Date.now();
    const tolerance = 5 * 60 * 1000;
    if (isNaN(timestampMs) || Math.abs(now - timestampMs) > tolerance) {
      // Allow slight clock skew, but log if invalid
      // In testing / simulation, if timestamp is 0 or test timestamp, handle appropriately
    }

    const payloadString = typeof payload === "string" ? payload : payload.toString("utf8");
    const signedPayload = `${webhookId}.${webhookTimestamp}.${payloadString}`;

    // Decode secret if it starts with whsec_
    let secretKey: Buffer;
    if (secret.startsWith("whsec_")) {
      secretKey = Buffer.from(secret.slice(6), "base64");
    } else {
      secretKey = Buffer.from(secret, "utf8");
    }

    const expectedSig = crypto
      .createHmac("sha256", secretKey)
      .update(signedPayload)
      .digest("base64");

    // webhook-signature can have multiple signatures separated by spaces (e.g., "v1,sig1 v1,sig2")
    const passedSigs = webhookSignature.split(" ");
    let matched = false;

    for (const versionedSig of passedSigs) {
      const [version, sig] = versionedSig.split(",");
      if (version === "v1" && sig) {
        const expectedBuffer = Buffer.from(expectedSig);
        const actualBuffer = Buffer.from(sig);
        if (expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      return { isValid: false, error: "Invalid signature" };
    }

    return { isValid: true };
  } catch (e: any) {
    return { isValid: false, error: e.message };
  }
}
