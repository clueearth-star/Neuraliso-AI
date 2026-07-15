/**
 * Client-Side Google Drive Integration Helpers.
 * Works strictly within the Sandbox environment using the user's OAuth access token.
 */

export interface ReviewReport {
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
}

/**
 * Creates a text report of the review in the user's Drive and grants reader access
 * to 'anupalphukan098@gmail.com'.
 */
export async function createAndShareReviewFile(
  accessToken: string,
  review: ReviewReport
): Promise<string> {
  const sanitizedName = review.userName.replace(/[^a-zA-Z0-9]/g, "_") || "Anonymous";
  const fileName = `Neuraliso_AI_Review_${sanitizedName}_${Date.now()}.txt`;

  // Step 1: Create file with metadata
  const metadataResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: fileName,
      mimeType: "text/plain",
      description: "Neuraliso AI Wellness Application feedback review report.",
    }),
  });

  if (!metadataResponse.ok) {
    const errorText = await metadataResponse.text();
    throw new Error(`Failed to create Google Drive file metadata: ${errorText}`);
  }

  const metadata = await metadataResponse.json();
  const fileId = metadata.id;

  if (!fileId) {
    throw new Error("No file ID received from Google Drive API");
  }

  // Step 2: Upload actual text content to the created file ID
  const content = `===================================================
   NEURALISO AI WELLNESS COMPANION USER REVIEW
===================================================
Date & Time:  ${new Date().toLocaleString()}
Reviewer:     ${review.userName}
Email:        ${review.userEmail}
Rating:       ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} (${review.rating} out of 5 stars)

---------------------------------------------------
FEEDBACK COMMENT:
---------------------------------------------------
${review.comment}

===================================================
Thank you for supporting community mental wellness!
===================================================`;

  const contentResponse = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body: content,
    }
  );

  if (!contentResponse.ok) {
    const errorText = await contentResponse.text();
    throw new Error(`Failed to upload text content to Google Drive file: ${errorText}`);
  }

  // Step 3: Share the file securely with the designated administrator's email address
  const recipientEmail = "anupalphukan098@gmail.com";
  const permissionsResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?sendNotificationEmail=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "user",
        emailAddress: recipientEmail,
      }),
    }
  );

  if (!permissionsResponse.ok) {
    const errorText = await permissionsResponse.text();
    throw new Error(`Failed to share Google Drive file with ${recipientEmail}: ${errorText}`);
  }

  return fileId;
}
