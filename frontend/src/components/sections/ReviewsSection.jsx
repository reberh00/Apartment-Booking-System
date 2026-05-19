export default function ReviewsSection({ reviewForm, setReviewForm, createReview, isOwner, replyForm, setReplyForm, replyToReview }) {
  return (
    <section className="card">
      <h2>Recenzije</h2>
      <form onSubmit={createReview} className="grid grid-3">
        <label>Reservation ID<input value={reviewForm.reservationId} onChange={(e) => setReviewForm((p) => ({ ...p, reservationId: e.target.value }))} required /></label>
        <label>Ocjena (1-5)<input type="number" min="1" max="5" value={reviewForm.rating} onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))} required /></label>
        <label>Komentar<input value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} required /></label>
        <button type="submit">Pošalji recenziju</button>
      </form>

      {isOwner ? (
        <form onSubmit={replyToReview} className="grid grid-2">
          <label>Review ID<input value={replyForm.reviewId} onChange={(e) => setReplyForm((p) => ({ ...p, reviewId: e.target.value }))} required /></label>
          <label>Odgovor vlasnika<input value={replyForm.reply} onChange={(e) => setReplyForm((p) => ({ ...p, reply: e.target.value }))} required /></label>
          <button type="submit">Odgovori na recenziju</button>
        </form>
      ) : null}
    </section>
  );
}
