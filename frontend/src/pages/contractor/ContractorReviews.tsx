import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { apiClient } from "@/services/api";

interface ApiReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId?: {
    name?: string;
  };
  projectId?: {
    title?: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

const ContractorReviews = () => {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const contractorData = await apiClient.get<{ contractor: { _id: string } }>("/contractors/me");
        const contractorId = contractorData.contractor?._id;

        if (!contractorId) {
          setReviews([]);
          return;
        }

        const reviewData = await apiClient.get<{ reviews: ApiReview[]; stats: ReviewStats }>(
          `/reviews/contractor/${contractorId}`
        );

        setReviews(Array.isArray(reviewData.reviews) ? reviewData.reviews : []);
        setStats(reviewData.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      } catch (requestError) {
        setError("Unable to load reviews right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, []);

  const fiveStarReviews = useMemo(() => stats.ratingDistribution?.[5] || 0, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Reviews</h1>
        <p className="text-sm text-muted-foreground">See what clients say about your work</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Average Rating" value={stats.averageRating.toFixed(1)} icon={Star} />
        <MetricCard title="Total Reviews" value={stats.totalReviews} icon={Star} />
        <MetricCard title="5-Star Reviews" value={fiveStarReviews} icon={Star} />
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading reviews...</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="space-y-4">
        {!loading && reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            No client reviews available yet.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{review.userId?.name || "Client"}</p>
                  {review.projectId?.title && <p className="text-xs text-muted-foreground">Project: {review.projectId.title}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <Star key={index} className={`h-4 w-4 ${index <= review.rating ? "fill-warning text-warning" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContractorReviews;
