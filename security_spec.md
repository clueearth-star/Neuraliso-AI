# Serene AI - Firestore Quality Assertion Schema & Security Specification

This document lays down the exact behavioral security rules and attribute-based security constraints for Firestore collections.

## 1. Data Invariants

1. **User Ownership Constraints**: Users may only access (create, read, update, delete) their own user document `/users/{userId}` and their child notes at `/users/{userId}/entries/{entryId}`.
2. **Authenticity Gates**:
   - `request.auth.uid` must match the path's `{userId}` variable.
   - For User profile creation, the embedded property `userId` must equal `request.auth.uid`.
3. **Strict Validation Constraints**:
   - `themeMode` is restricted to an enum values list `["light", "neutral"]`.
   - `mood` is restricted to emotional frequencies `["sad", "anxious", "overwhelmed", "lonely", "neutral", "happy"]`.
   - `stress` and `energy` must be integers between 1 and 10.
   - Strict size bounds are enforced on text like `displayName` (<= 100 characters) and `note` (<= 5000 characters).
4. **Temporal Invariance**:
   - `createdAt` is immutable after first creation.
   - `updatedAt` and `createdAt` must match standard server timestamp variables (`request.time`).

## 2. The Dirty Dozen (Malicious Payloads)

Below are the 12 specific payloads representing unauthorized requests that MUST be denied by `firestore.rules`:

1. **The Identity Spoofer**: Write a user document inside `/users/attacker_id` with `userId` of `victim_id`. (Fails: path ID does not equal auth UID or payload uid).
2. **Anonymous Write Attack**: Create user profile with unauthenticated `request.auth == null` header. (Fails: checks `request.auth != null`).
3. **Ghost Field Poisoning**: Modify user options list with unexpected keys (e.g. `isVIPAdminPrivilege: true`). (Fails: `hasOnly()` keys assert).
4. **Invalid Enum Mode Injection**: Set the user theme preferences to `dark`. (Fails: `themeMode` enum validation).
5. **No-Size Buffer Flood**: Store a 2MB note message inside `displayName`. (Fails: `.size() <= 100` string check).
6. **Time-Travel Spoofing**: Provide client-fabricated `createdAt` epoch instead of `request.time` server timestamp. (Fails: strict server time assertion).
7. **Negative Metric Poisoning**: Save a journal note with a stress rating of `-5` or `12`. (Fails: `>= 1` and `<= 10` boundary rules).
8. **Inter-User Note Theft**: Attempt `get` query to `/users/victim_user_id/entries/note_123` from `attacker_user_id`. (Fails: checks owner identity constraint).
9. **Blanket Query Scraping**: General query list requests towards `/users` collection without user-scoped `where` clause bounds. (Fails: rule queries `resource.data` restriction).
10. **Immutable Value Override**: Attempting update to `createdAt` or `id` attributes that are structurally finalized. (Fails: immutability check).
11. **Orphaned Write Creation**: Post a journal entry under a user record that does not match the active account credential. (Fails: checks hierarchy match).
12. **Status Poisoning**: Save `mood` as `undefined` or inject fake emotional profiles. (Fails: enum check).

## 3. Test Verification Rules

These behaviors are rigorously verified in standard sandboxed assertions before final rules are deployed.
