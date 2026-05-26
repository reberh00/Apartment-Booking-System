import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';

export default function OwnerReservationDetailsPage({ token, setFeedback, statusBadgeClass, updateReservationStatus }) {
  const { reservationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyForm, setReplyForm] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadReservation() {
      try {
        setLoading(true);
        const [reservationData, messageData] = await Promise.all([
          api.get(`/reservations/${reservationId}`, token),
          api.get(`/messages/${reservationId}`, token),
        ]);
        if (ignore) return;
        setReservation(reservationData);
        setReplyForm(reservationData.review?.ownerReply || '');
        setMessages(messageData);
      } catch (err) {
        if (!ignore) {
          setFeedback(err.message, true);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadReservation();

    return () => {
      ignore = true;
    };
  }, [reservationId, setFeedback, token]);

  async function changeStatus(status) {
    if (!reservation) return;

    try {
      await updateReservationStatus(reservation.id, status);
      setReservation((prev) => (prev ? { ...prev, status } : prev));
    } catch {
      // feedback is handled in App updateReservationStatus
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      setSendingMessage(true);
      await api.post('/messages', {
        reservationId,
        content: messageText,
      }, token);
      const messageData = await api.get(`/messages/${reservationId}`, token);
      setMessages(messageData);
      setMessageText('');
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setSendingMessage(false);
    }
  }

  async function submitOwnerReply(e) {
    e.preventDefault();
    if (!reservation?.review?.id) return;

    try {
      setSubmittingReply(true);
      const updatedReview = await api.patch(`/reviews/${reservation.review.id}/reply`, {
        reply: replyForm.trim(),
      }, token);

      setReservation((prev) => (prev ? {
        ...prev,
        review: {
          ...prev.review,
          ownerReply: updatedReview.ownerReply,
        },
      } : prev));

      setReplyForm(updatedReview.ownerReply || '');
      setFeedback('Odgovor na recenziju je spremljen.');
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setSubmittingReply(false);
    }
  }

  if (loading) {
    return (
      <section className="card">
        <h2>Učitavanje rezervacije...</h2>
      </section>
    );
  }

  if (!reservation) {
    return (
      <section className="card">
        <h2>Rezervacija nije pronađena.</h2>
        <button type="button" onClick={() => navigate('/app/owner/reservations')}>Natrag na rezervacije</button>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="row between">
        <h2>Detalji rezervacije (vlasnik)</h2>
        <button type="button" className="ghost" onClick={() => navigate('/app/owner/reservations')}>Natrag</button>
      </div>

      <div className="list compact">
        <article className="list-item">
          <p><strong>ID:</strong> {reservation.id}</p>
          <p><strong>Apartman:</strong> {reservation.apartment?.title || reservation.apartmentId}</p>
          <p><strong>Gost:</strong> {reservation.guest?.firstName} {reservation.guest?.lastName}</p>
          <p><strong>Kontakt gosta:</strong> {reservation.guest?.email || '-'}</p>
          <p><strong>Status:</strong> <span className={statusBadgeClass(reservation.status)}>{reservation.status}</span></p>
          <p><strong>Check-in:</strong> {String(reservation.checkIn).slice(0, 10)}</p>
          <p><strong>Check-out:</strong> {String(reservation.checkOut).slice(0, 10)}</p>
          <p><strong>Broj gostiju:</strong> {reservation.numGuests}</p>
          <p><strong>Ukupna cijena:</strong> {reservation.totalPrice}</p>
        </article>
      </div>

      <div className="row gap">
        <button
          type="button"
          onClick={() => changeStatus('CONFIRMED')}
          disabled={reservation.status !== 'PENDING'}
        >
          Potvrdi
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => changeStatus('REJECTED')}
          disabled={reservation.status !== 'PENDING'}
        >
          Odbij
        </button>
      </div>

      {reservation.review ? (
        <section className="card">
          <h3>Recenzija gosta</h3>
          <div className="list compact">
            <article className="list-item">
              <p><strong>Ocjena:</strong> {reservation.review.rating}/5</p>
              <p><strong>Komentar:</strong> {reservation.review.comment}</p>
              {reservation.review.ownerReply ? <p><strong>Vaš odgovor:</strong> {reservation.review.ownerReply}</p> : null}
            </article>
          </div>

          <form onSubmit={submitOwnerReply} className="grid grid-2">
            <label>
              Odgovor vlasnika
              <input
                value={replyForm}
                onChange={(e) => setReplyForm(e.target.value)}
                minLength={5}
                maxLength={500}
                required
              />
            </label>
            <button type="submit" disabled={submittingReply}>
              {submittingReply ? 'Spremanje...' : reservation.review.ownerReply ? 'Ažuriraj odgovor' : 'Pošalji odgovor'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="card">
        <h3>Chat s gostom</h3>
        <form onSubmit={sendMessage} className="grid grid-2">
          <label>
            Nova poruka
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={sendingMessage}>{sendingMessage ? 'Slanje...' : 'Pošalji poruku'}</button>
        </form>
        <div className="list compact">
          {messages.map((message) => (
            <div key={message.id} className="list-item">
              <strong>{message.sender?.firstName} {message.sender?.lastName}:</strong> {message.content}
            </div>
          ))}
          {messages.length === 0 ? <div className="list-item">Nema poruka za ovu rezervaciju.</div> : null}
        </div>
      </section>
    </section>
  );
}
