import ReviewsSection from '../../components/sections/ReviewsSection';

export default function ReviewsPage({ reviewForm, setReviewForm, createReview, isOwner, replyForm, setReplyForm, replyToReview }) {
  return (
    <ReviewsSection
      reviewForm={reviewForm}
      setReviewForm={setReviewForm}
      createReview={createReview}
      isOwner={isOwner}
      replyForm={replyForm}
      setReplyForm={setReplyForm}
      replyToReview={replyToReview}
    />
  );
}
