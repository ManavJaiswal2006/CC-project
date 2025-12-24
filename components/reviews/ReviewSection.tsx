"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/app/context/AuthContext";
import { Star, CheckCircle2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface ReviewSectionProps {
  productId: Id<"products">;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= CONVEX ================= */
  const reviews = useQuery(api.review.getProductReviews, { productId });
  const ratingSummary = useQuery(api.review.getProductRatingSummary, { productId });
  const hasPurchased = useQuery(
    api.review.hasPurchasedProduct,
    user?.uid ? { userId: user.uid, productId } : "skip"
  );

  const createReview = useMutation(api.review.createReview);
  const markHelpful = useMutation(api.review.markHelpful);

  /* ================= HANDLERS ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !user.email || submitting) return;

    setSubmitting(true);
    try {
      await createReview({
        productId,
        userId: user.uid,
        userName: user.displayName || user.email.split("@")[0],
        rating,
        comment: comment.trim(),
      });
      setShowForm(false);
      setComment("");
      setRating(5);
    } catch (error: any) {
      alert(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markHelpful({ reviewId: reviewId as any });
    } catch (error) {
      console.error("Mark helpful error", error);
    }
  };

  /* ================= UI ================= */
  return (
    <section className="border-t pt-8 mt-8">
      <h2 className="text-xl font-bold uppercase mb-6">Customer Reviews</h2>

      {/* RATING SUMMARY */}
      {ratingSummary && ratingSummary.count > 0 && (
        <div className="mb-8 p-6 bg-gray-50 border">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold">
              {ratingSummary.average.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={
                      star <= Math.round(ratingSummary.average)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Based on {ratingSummary.count} review{ratingSummary.count > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* RATING DISTRIBUTION */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingSummary.distribution[star as keyof typeof ratingSummary.distribution];
              const percentage = (count / ratingSummary.count) * 100;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-8">{star} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REVIEW FORM */}
      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-6 py-3 border border-black text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
        >
          Write a Review
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border bg-gray-50">
          <h3 className="font-bold mb-4">Write Your Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    className={
                      star <= rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Share your experience with this product..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setComment("");
                setRating(5);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 text-[11px] font-black uppercase tracking-[0.2em] hover:border-black transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* REVIEWS LIST */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review: any) => (
            <div key={review._id} className="border-b pb-6 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{review.userName}</p>
                    {review.verifiedPurchase && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 size={12} />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkHelpful(review._id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ThumbsUp size={14} />
                  Helpful ({review.helpful})
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-200">
          <p className="text-gray-500 mb-2">No reviews yet</p>
          <p className="text-sm text-gray-400">
            Be the first to review this product!
          </p>
        </div>
      )}
    </section>
  );
}

