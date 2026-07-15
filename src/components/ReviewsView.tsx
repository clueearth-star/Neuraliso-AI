import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { 
  db, 
  getAccessToken, 
  handleFirestoreError, 
  OperationType, 
  loginWithGoogle as firebaseLoginWithGoogle, 
  loginWithEmail as firebaseLoginWithEmail, 
  registerWithEmail as firebaseRegisterWithEmail 
} from "../firebase";
import { createAndShareReviewFile } from "../lib/drive";
import { Star, MessageSquare, PenTool, Check, Loader2, ChevronLeft, User, Calendar, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReviewsViewProps {
  onBackToDashboard: () => void;
  currentUser?: any;
  loginWithGoogle?: () => Promise<any>;
  loginWithEmail?: (email: string, pass: string) => Promise<any>;
  registerWithEmail?: (email: string, pass: string, name: string) => Promise<any>;
  isAuth0Active?: boolean;
}

interface UserReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ 
  onBackToDashboard, 
  currentUser,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  isAuth0Active
}) => {
  const [reviews, setReviews] = useState<UserReview[]>(() => {
    const cached = localStorage.getItem("neuraliso_cached_reviews");
    try {
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = localStorage.getItem("neuraliso_cached_reviews");
    try {
      return cached && JSON.parse(cached).length > 0 ? false : true;
    } catch {
      return true;
    }
  });
  
  // Submission Form State
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"options" | "email_login" | "email_register">("options");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isAuth0Active && loginWithGoogle) {
        await loginWithGoogle();
      } else {
        await firebaseLoginWithGoogle();
      }
    } catch (err: any) {
      if (err.message?.includes("popup-closed-by-user") || err.code?.includes("popup-closed-by-user")) {
        setAuthError("Popup closed before completing sign-in. Please try again!");
      } else {
        setAuthError(err.message || "Failed to log in with Google.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError("Please fill out all fields.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isAuth0Active && loginWithEmail) {
        await loginWithEmail(emailInput, passwordInput);
      } else {
        await firebaseLoginWithEmail(emailInput, passwordInput);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput || !nameInput) {
      setAuthError("Please fill out all fields.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isAuth0Active && registerWithEmail) {
        await registerWithEmail(emailInput, passwordInput, nameInput);
      } else {
        await firebaseRegisterWithEmail(emailInput, passwordInput, nameInput);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to register account. Password must be at least 6 characters.");
    } finally {
      setAuthLoading(false);
    }
  };

  const user = currentUser ? {
    uid: currentUser.uid || currentUser.id,
    userId: currentUser.uid || currentUser.id,
    displayName: currentUser.displayName || "Neuraliso Seeker",
    email: currentUser.email || ""
  } : null;

  const [reviewerName, setReviewerName] = useState<string>(() => {
    return currentUser ? (currentUser.displayName || "Neuraliso Seeker") : "";
  });

  // Keep reviewerName synchronized if user logs in/out or changes profile using primitive values
  const currentUserId = currentUser?.uid;
  const currentUserDisplayName = currentUser?.displayName;
  useEffect(() => {
    if (currentUserId) {
      setReviewerName(currentUserDisplayName || "Neuraliso Seeker");
    } else {
      setReviewerName("");
    }
  }, [currentUserId, currentUserDisplayName]);

  // Fetch reviews directly from the verified Supabase project
  const fetchReviewsFromSupabase = async () => {
    try {
      const res = await fetch("/api/reviews", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`Supabase query failed with status ${res.status}`);
      }

      const rawItems = await res.json();
      if (Array.isArray(rawItems)) {
        const parsed: UserReview[] = rawItems.map((item: any) => {
          let userName = "Verified Seeker";
          let rating = 5;
          let comment = item.Reviews || "";
          let userId = "guest";
          
          if (item.Reviews && item.Reviews.trim().startsWith("{")) {
            try {
              const parsedJson = JSON.parse(item.Reviews);
              if (parsedJson) {
                if (parsedJson.userName) userName = String(parsedJson.userName);
                if (typeof parsedJson.rating === "number") rating = parsedJson.rating;
                else if (parsedJson.rating) rating = Number(parsedJson.rating) || 5;
                if (parsedJson.comment) comment = String(parsedJson.comment);
                if (parsedJson.userId) userId = String(parsedJson.userId);
              }
            } catch (e) {
              // Raw string fallback
            }
          }

          return {
            id: String(item.id),
            userId: userId,
            userName: userName,
            rating: rating,
            comment: comment,
            createdAt: item.created_at || new Date().toISOString()
          };
        });

        setReviews(parsed);
        localStorage.setItem("neuraliso_cached_reviews", JSON.stringify(parsed));
      }
      setLoading(false);
    } catch (error) {
      console.warn("Supabase query error, fallback to cached comments:", error);
      setLoading(false);
    }
  };

  // Real-time listener for reviews (polling Supabase every 5 seconds for live sync)
  useEffect(() => {
    fetchReviewsFromSupabase();
    
    const interval = setInterval(() => {
      fetchReviewsFromSupabase();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  
  const starCounts = [0, 0, 0, 0, 0]; // 5 to 1
  reviews.forEach((r) => {
    const idx = 5 - r.rating;
    if (idx >= 0 && idx < 5) {
      starCounts[idx]++;
    }
  });

  const getPercentage = (count: number) => {
    if (reviews.length === 0) return 0;
    return Math.round((count / reviews.length) * 100);
  };

  // Submit feedback handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setErrorMsg("Authentication required. Please log in or sign up to leave an honest review.");
      return;
    }
    
    const finalName = reviewerName.trim();
    if (finalName.length < 2) {
      setErrorMsg("Please enter your name (at least 2 characters).");
      return;
    }

    const originalComment = comment.trim();
    if (originalComment.length < 5) {
      setErrorMsg("Review comment must be at least 5 characters long.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const uid = user ? user.uid : `guest_${Date.now()}`;
    const userEmail = user ? user.email : "";
    const originalRating = rating;

    try {
      // 1. Save to Supabase via our secure backend proxy route
      const payload = {
        "Reviews": JSON.stringify({
          userName: finalName,
          rating: originalRating,
          comment: originalComment,
          userId: uid
        })
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Review submission request failed with status code ${res.status}`);
      }

      const responseData = await res.json();
      console.log("[Supabase Proxy Client] Successfully saved review:", responseData);

      // Clear layout fields instantly to give immediate visual response feedback
      setComment("");
      if (!user) {
        setReviewerName("");
      }
      setRating(5);
      setSuccessMsg("Peace with you! Your review has been published live on the reflection wall instantly!");

      // Refresh reviews list so user sees their review immediately added and fetched natively from Supabase
      await fetchReviewsFromSupabase();

      // 2. Trigger secure, background email routing entirely on the backend server
      (async () => {
        try {
          const notifyRes = await fetch("/api/reviews/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userName: finalName,
              rating: originalRating,
              comment: originalComment,
              userId: uid,
              userEmail: userEmail,
            }),
          });
          const apiData = await notifyRes.json();
          if (notifyRes.ok) {
            console.log("[Reviews] Backend email dispatch acknowledged:", apiData.message);
          } else {
            console.warn("[Reviews] Backend email dispatch warning:", apiData.error);
          }
        } catch (apiErr) {
          console.warn("[Reviews] Non-blocking background notification endpoint skip:", apiErr);
        }
      })();

      // 3. Queue the Google Drive Export as a non-blocking background task (only if user logged in with Drive token)
      if (user) {
        (async () => {
          try {
            const token = await getAccessToken();
            if (token) {
              console.log("Found Google Drive token, sharing text transcript with administrator...");
              await createAndShareReviewFile(token, {
                rating: originalRating,
                comment: originalComment,
                userName: finalName,
                userEmail: userEmail,
              });
              setSuccessMsg("Peace with you! Your review has been published live and shared with the Neuraliso team successfully!");
            } else {
              console.warn("No active Google Drive credentials cached. Published securely in central Database.");
            }
          } catch (driveErr: any) {
            console.error("Non-fatal background Drive export skipped:", driveErr);
          }
        })();
      }

    } catch (err: any) {
      console.error("Critical Supabase save failed:", err);
      setErrorMsg(err.message || "An unexpected error occurred while saving your review to our database.");
    } finally {
      setSubmitting(false);
    }
  };

  // Human-readable simple date formatter
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    
    // Check if firestore serverTimestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div id="reviews-viewport" className="space-y-6 animate-fade-in text-left pb-16">
      
      {/* HEADER SECTION with navigation action */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-150">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1 text-xs font-bold text-muted-text hover:text-dark-text transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-[10px] uppercase font-mono tracking-widest text-muted-text">
          Somatic Feedbacks
        </span>
      </div>

      <div className="py-2 space-y-1.5">
        <h2 className="text-3xl font-serif italic text-dark-text font-bold tracking-tight">
          Community Reflections
        </h2>
        <p className="text-xs text-muted-text leading-relaxed">
          Read genuine reviews from other seekers or authentic users online, or share your companion journey to inspire others.
        </p>
      </div>

      {/* RATINGS REPORT CARD & STATS SUMMARY (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* BIG RATING HERO PANEL */}
        <div className="md:col-span-5 wellness-card p-6 bg-white border border-slate-100 flex flex-col justify-center items-center text-center space-y-4 shadow-sm">
          <span className="text-xs font-mono font-medium text-primary-sage uppercase tracking-wider">
            Overall Rating
          </span>
          <div className="space-y-1">
            <h3 className="text-6xl font-extrabold tracking-tighter text-slate-900 font-serif">
              {averageRating}
            </h3>
            <div className="flex items-center justify-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.round(parseFloat(averageRating)) ? "currentColor" : "none"}
                  className="stroke-amber-400"
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-muted-text">
            Based on {reviews.length} genuine {reviews.length === 1 ? "review" : "reviews"} online
          </span>
        </div>

        {/* STARS BAR CHART DISTRIBUTION PANEL */}
        <div className="md:col-span-7 wellness-card p-6 bg-white border border-slate-100 flex flex-col justify-center space-y-2.5 shadow-sm">
          {starCounts.map((count, index) => {
            const starNum = 5 - index;
            const pct = getPercentage(count);
            return (
              <div key={starNum} className="flex items-center text-xs space-x-3.5">
                <span className="w-12 font-medium text-slate-600 flex items-center gap-1 justify-end">
                  <span>{starNum}</span>
                  <Star size={11} fill="currentColor" className="text-amber-400 stroke-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-sage rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-muted-text">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK SUBMISSION SECTION */}
      <div className="wellness-card p-6 bg-white border border-slate-150 shadow-sm relative overflow-hidden space-y-5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-sage" />
        
        {/* BLURRED GUEST LOCK OVERLAY */}
        {!user && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in overflow-y-auto">
            <div className="w-12 h-12 rounded-full bg-primary-sage/10 flex items-center justify-center text-primary-sage shadow-xs">
              <User size={22} strokeWidth={2.5} />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-base font-serif font-bold text-dark-text">Authentication Required</h4>
              <p className="text-xs text-muted-text leading-relaxed">
                Sharing honest reviews on the somatic reflection wall is reserved for verified seekers. Please authorize secure credentials to contribute.
              </p>
              {authError && (
                <div className="p-3 bg-red-50 text-red-700 text-[11px] rounded-xl font-sans text-left leading-normal border border-red-150">
                  ⚠️ {authError}
                </div>
              )}
            </div>

            <div className="w-full max-w-xs space-y-3">
              {authMode === "options" && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full bg-primary-sage text-white font-bold py-2.5 px-4 rounded-full hover:bg-deep-sage transition-all text-xs h-10 active:scale-95 cursor-pointer shadow-sm shadow-primary-sage/15 flex items-center justify-center gap-1.5"
                  >
                    <span>{authLoading ? "Verifying..." : "🔑 Quick Google Sign-In"}</span>
                  </button>

                  <div className="flex items-center gap-2 justify-center my-1.5 text-slate-400 text-[9px] font-mono">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span>OR USE EMAIL</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setAuthMode("email_login"); setAuthError(null); }}
                      className="bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode("email_register"); setAuthError(null); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-2 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}

              {authMode === "email_login" && (
                <form onSubmit={handleEmailSignIn} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMode("options"); setAuthError(null); }}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl cursor-pointer transition-all text-center"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-2/3 bg-deep-sage hover:bg-primary-sage text-white font-bold text-xs py-2 rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <span>{authLoading ? "Verifying..." : "Confirm Login 🔑"}</span>
                    </button>
                  </div>
                </form>
              )}

              {authMode === "email_register" && (
                <form onSubmit={handleEmailRegister} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Aura Seeker"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="•••••••• (min 6 chars)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMode("options"); setAuthError(null); }}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl cursor-pointer transition-all text-center"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-2/3 bg-deep-sage hover:bg-primary-sage text-white font-bold text-xs py-2 rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <span>{authLoading ? "Creating..." : "Create Account 📝"}</span>
                    </button>
                  </div>
                </form>
              )}

              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-full bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-full hover:bg-slate-200 transition-all text-xs h-9 active:scale-95 cursor-pointer flex items-center justify-center mt-2"
              >
                <span>← Back to Dashboard</span>
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
          <PenTool size={18} className="text-primary-sage" />
          <h3 className="text-lg font-serif font-semibold text-dark-text">
            Leave an Honest Review
          </h3>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmitReview}
            className="space-y-4 text-left"
          >
            {/* CURRENT ACCOUNT STATUS INDICATOR */}
            <div className="flex items-center justify-between text-xs font-mono text-muted-text border-b pb-2.5 border-dashed border-slate-100">
              <span className="flex items-center gap-1">
                <User size={13} className="text-primary-sage" />
                <span>
                  Status: <strong>{user ? "Authenticated Seeker" : "Guest Companion"}</strong>
                </span>
              </span>
              {user && (
                <span className="hidden sm:inline text-slate-400">
                  {user.email}
                </span>
              )}
            </div>

            {/* NAME INPUT FIELD */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="reviewer-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Your Name or Nickname <span className="text-rose-500">*</span>
              </label>
              <input
                id="reviewer-name-input"
                type="text"
                required
                placeholder="Enter your name or preferred moniker"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full text-sm rounded-2xl border border-slate-250 p-3 h-11 focus:ring-2 focus:ring-primary-sage focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* STAR INPUT SELECTOR */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Your Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl inline-flex border border-slate-100">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = i + 1;
                  const isHighlighted = starVal <= (hoverRating !== null ? hoverRating : rating);
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 cursor-pointer transition-transform duration-100 active:scale-90"
                    >
                      <Star
                        size={24}
                        fill={isHighlighted ? "currentColor" : "none"}
                        className={`transition-colors duration-150 ${
                          isHighlighted ? "text-amber-400 stroke-amber-400" : "text-slate-300 stroke-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COMMENTS TEXTAREA */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="review-comments-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Share Your Wellness Experience <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="review-comments-input"
                rows={4}
                maxLength={1000}
                required
                placeholder="How has Neuraliso AI supported your mental health, stress management, and daily routines? What parts of the somatic breathing schemes should we elevate?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-sm rounded-2xl border border-slate-250 p-4 focus:ring-2 focus:ring-primary-sage focus:outline-none bg-slate-50/50 resize-y"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Destination: <strong>Somatic Reflection Vault</strong></span>
                <span>{comment.length}/1000 chars</span>
              </div>
            </div>

            {/* NOTIFICATION FEEDBACKS */}
            {successMsg && (
              <div className="flex items-start gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 p-3.5 rounded-2xl">
                <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <p>{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-start gap-2 text-xs bg-rose-50 text-rose-800 border border-rose-100 p-3.5 rounded-2xl">
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* SUBMIT BUTTON WITH LOADER AND 44PX TOUCH RADIUS */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-sage text-white font-bold py-3.5 rounded-full hover:bg-deep-sage transition-all disabled:opacity-50 active:scale-97 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-primary-sage/20 h-12"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Syncing Review with Vault & Cloud DB...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={16} />
                    <span>Publish Reflection</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </div>

      {/* REVIEWS LIST VIEWER REAL-TIME */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-text border-b pb-2 border-dashed border-slate-200">
          Recent Shared Reflection Logs
        </h3>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="animate-spin text-primary-sage" size={24} />
            <span className="text-xs text-muted-text font-mono uppercase tracking-widest">
              Connecting reflection portal...
            </span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
            <span className="text-3xl block filter grayscale mb-2">🌸</span>
            <p className="text-xs text-muted-text">
              No public reflections registered yet. Be the first to share your journey!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                id={`user-review-card-${rev.id}`}
                className="wellness-card p-5 bg-white border border-slate-100 shadow-xs text-left space-y-3 transition-all hover:bg-slate-50/40 relative duration-300 animate-slide-up"
              >
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-dark-text flex items-center gap-1.5">
                      <span>{rev.userName}</span>
                      <span className="inline-flex items-center text-[9px] font-mono uppercase font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md border border-green-100">
                        ✓ Verified Seeker
                      </span>
                    </h4>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                      <Calendar size={11} />
                      <span>{formatDate(rev.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < rev.rating ? "currentColor" : "none"}
                        className="stroke-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-dark-text leading-relaxed whitespace-pre-wrap font-sans">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
