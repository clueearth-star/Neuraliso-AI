import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendReviewEmail } from "../_lib/reviews-service.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userName, rating, comment, userId, userEmail } = req.body;
    if (!userName || rating == null || !comment) {
      return res.status(400).json({ error: "Name, rating, and comment are required." });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be a valid integer between 1 and 5." });
    }

    const result = await sendReviewEmail({
      userName: userName.substring(0, 100),
      rating: numRating,
      comment: comment.substring(0, 1500),
      userId: userId ? String(userId).substring(0, 150) : "guest",
      userEmail: userEmail ? String(userEmail).substring(0, 150) : "",
    });

    res.json({ success: true, sent: result.sent, message: result.message });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error during notification dispatch." });
  }
}
