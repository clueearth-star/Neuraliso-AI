import nodemailer from "nodemailer";
import { getResolvedKeys } from "./keys.js";

export interface ReviewNotificationPayload {
  userName: string;
  rating: number;
  comment: string;
  userId?: string;
  userEmail?: string;
}

export function analyzeSentimentAndItem(comment: string, rating: number) {
  let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
  if (rating >= 4) {
    sentiment = "Positive";
  } else if (rating <= 2) {
    sentiment = "Negative";
  } else {
    const lower = comment.toLowerCase();
    const posWords = ["love", "great", "excellent", "good", "happy", "amazing", "wonderful", "peaceful", "calm", "serene", "polished"];
    const negWords = ["bad", "worst", "hate", "issue", "error", "fail", "slow", "annoyed", "useless", "broken", "terrible"];
    const posCount = posWords.filter((w) => lower.includes(w)).length;
    const negCount = negWords.filter((w) => lower.includes(w)).length;
    if (posCount > negCount) sentiment = "Positive";
    else if (negCount > posCount) sentiment = "Negative";
  }

  let itemName = "Serene Seeker";
  const lowerComment = comment.toLowerCase();
  if (lowerComment.includes("quitify")) {
    itemName = "Quitify";
  } else if (lowerComment.includes("serene")) {
    itemName = "Serene Seeker";
  } else {
    const match = comment.match(/(?:enjoying|using|love|for|about|with)\s+([A-Z][a-zA-Z0-9_]+)/);
    if (match?.[1]) itemName = match[1];
  }

  return { sentiment, itemName };
}

export async function sendReviewEmail(
  review: ReviewNotificationPayload
): Promise<{ sent: boolean; message: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Recipient must come from an env var now — no hardcoded/obfuscated
  // email address baked into source.
  const targetEmail = process.env.REVIEWS_NOTIFICATION_EMAIL;

  if (!smtpHost || !smtpUser || !smtpPass || !targetEmail) {
    console.warn(
      `[Mail Service] SMTP configuration missing. Review logged: [${review.rating} Stars] by ${review.userName}: "${review.comment}"`
    );
    return { sent: false, message: "SMTP settings not configured. Review logged on server instead." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const mailOptions = {
      from: `"Serene AI Reviews" <${smtpUser}>`,
      to: targetEmail,
      subject: `🌸 New Serene AI Review: ${review.rating} Stars by ${review.userName}`,
      text: `A new review has been submitted for Serene AI.\n\n- Name: ${review.userName}\n- Rating: ${review.rating}/5\n- Reviewer ID: ${review.userId || "Guest"}\n- Reviewer Email: ${review.userEmail || "Not Provided"}\n- Comment: "${review.comment}"`,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
        <h2 style="color: #2d3748;">🌸 New Serene AI Review</h2>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #e2e8f0;">
          <p><strong>Name:</strong> ${review.userName}</p>
          <p><strong>Rating:</strong> ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} (${review.rating}/5)</p>
          <p><strong>User ID:</strong> <code>${review.userId || "Guest"}</code></p>
          <p><strong>User Email:</strong> ${review.userEmail || "Not Provided"}</p>
          <p style="border-top: 1px dashed #cbd5e1; padding-top: 15px; font-style: italic;">"${review.comment}"</p>
        </div>
      </div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    return { sent: true, message: `Email sent. Message ID: ${info.messageId}` };
  } catch (error: any) {
    return { sent: false, message: `SMTP delivery failed: ${error.message || error}` };
  }
}

export async function syncReviewToSupabase(comment: string, rating: number, userName = "Anonymous Seeker") {
  try {
    const { sentiment, itemName } = analyzeSentimentAndItem(comment, rating);
    const payload = {
      Reviews: JSON.stringify({ userName, rating, comment, sentiment_analysis: sentiment, item_name: itemName }),
    };

    const { resolvedSupabaseKey } = getResolvedKeys();
    const targetUrl = "https://tmmrquzeoykocirbempg.supabase.co/rest/v1/Reviews%20System";

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        apikey: resolvedSupabaseKey,
        Authorization: `Bearer ${resolvedSupabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`[Supabase Sync] Failed. Status: ${response.status}`);
    }
  } catch (err: any) {
    console.warn("[Supabase Sync] Skipped:", err.message || err);
  }
}
