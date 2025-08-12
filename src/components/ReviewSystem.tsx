import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarIcon } from 'lucide-react';
import { Review, UserProfile } from '@/types';
import { createReview } from '@/services/dataService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewSystemProps {
  targetUser: UserProfile;
  requestId?: string;
  onReviewSubmitted?: (review: Review) => void;
}

interface ReviewDisplayProps {
  reviews: Review[];
}

// Star Rating Component
function StarRating({ rating, onRatingChange, interactive = false }: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const isActive = interactive 
          ? (hoverRating || rating) >= starValue
          : rating >= starValue;
        
        return (
          <StarIcon
            key={i}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              isActive
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
            onClick={interactive ? () => onRatingChange?.(starValue) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(starValue) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        );
      })}
    </div>
  );
}

// Write Review Component
export function WriteReview({ targetUser, requestId, onReviewSubmitted }: ReviewSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a review.",
        variant: "destructive"
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive"
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please write a comment about your experience.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview = await createReview({
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatar,
        toUserId: targetUser.id,
        requestId,
        rating,
        comment: comment.trim()
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!"
      });

      // Reset form
      setRating(0);
      setComment('');
      
      onReviewSubmitted?.(newReview);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={targetUser.avatar} alt={targetUser.name} />
            <AvatarFallback>
              {targetUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          Leave a Review for {targetUser.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating}
              interactive={true}
            />
            <p className="text-sm text-gray-600">
              {rating === 0 && "Click to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience working with this person..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500 characters
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Display Reviews Component
export function ReviewDisplay({ reviews }: ReviewDisplayProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reviews ({reviews.length})</span>
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} />
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} average
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.fromUserAvatar} alt={review.fromUserName} />
                  <AvatarFallback>
                    {review.fromUserName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{review.fromUserName}</h4>
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}