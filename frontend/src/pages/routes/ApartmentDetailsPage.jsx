import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';

const editableKeys = [
  'title',
  'description',
  'city',
  'country',
  'address',
  'latitude',
  'longitude',
  'pricePerNight',
  'maxGuests',
  'minNights',
  'cancellationPolicy',
];

export default function ApartmentDetailsPage({
  user,
  token,
  setFeedback,
  updateApartment,
  contentsOptions,
  createReservationForApartment,
  checkApartmentAvailability,
  defaultBackPath,
}) {
  const { apartmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [apartment, setApartment] = useState(null);
  const [form, setForm] = useState(null);
  const [reservationForm, setReservationForm] = useState({ checkIn: '', checkOut: '', numGuests: 1 });

  const isOwner = useMemo(() => {
    if (!user || !apartment) return false;
    return apartment.owner?.id === user.id;
  }, [user, apartment]);

  useEffect(() => {
    let ignore = false;

    async function loadApartment() {
      try {
        setLoading(true);
        const data = await api.get(`/apartments/${apartmentId}`);
        if (ignore) return;

        setApartment(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          city: data.city || '',
          country: data.country || '',
          address: data.address || '',
          latitude: data.latitude ?? '',
          longitude: data.longitude ?? '',
          pricePerNight: data.pricePerNight ?? '',
          maxGuests: data.maxGuests ?? '',
          minNights: data.minNights ?? '',
          cancellationPolicy: data.cancellationPolicy || 'FLEXIBLE',
          contentIds: (data.contents || []).map((item) => item.contentId || item.content?.id).filter(Boolean),
        });
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

    void loadApartment();

    return () => {
      ignore = true;
    };
  }, [apartmentId, setFeedback]);

  function formatDate(date) {
    const parsed = new Date(date);
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async function saveApartment(e) {
    e.preventDefault();

    try {
      setSaving(true);
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
        minNights: Number(form.minNights),
        contentIds: form.contentIds,
      };

      await updateApartment(apartmentId, payload);
      const refreshed = await api.get(`/apartments/${apartmentId}`);
      setApartment(refreshed);
      setEditMode(false);
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  async function reserveApartment(e) {
    e.preventDefault();

    if (!token) {
      setFeedback('Za rezervaciju se morate prijaviti.', true);
      return;
    }

    try {
      setReserving(true);
      await createReservationForApartment(apartmentId, reservationForm);
      setReservationForm({ checkIn: '', checkOut: '', numGuests: 1 });
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setReserving(false);
    }
  }

  async function checkAvailability() {
    try {
      await checkApartmentAvailability(apartmentId, reservationForm.checkIn, reservationForm.checkOut);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  if (loading) {
    return (
      <section className="card">
        <h2>Učitavanje apartmana...</h2>
      </section>
    );
  }

  if (!apartment || !form) {
    return (
      <section className="card">
        <h2>Apartman nije pronađen.</h2>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="row between">
        <h2>Detalji apartmana</h2>
        <div className="row gap">
          {isOwner && !editMode ? (
            <button type="button" onClick={() => setEditMode(true)}>Uredi</button>
          ) : null}
          {isOwner && editMode ? (
            <button type="button" className="ghost" onClick={() => setEditMode(false)}>Odustani</button>
          ) : null}
          <button type="button" className="ghost" onClick={() => navigate(defaultBackPath)}>Natrag</button>
        </div>
      </div>

      {editMode && isOwner ? (
        <form onSubmit={saveApartment} className="grid grid-3">
          {editableKeys.map((key) => (
            <label key={key}>
              {key}
              {key === 'cancellationPolicy' ? (
                <select value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}>
                  <option value="FLEXIBLE">FLEXIBLE</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="STRICT">STRICT</option>
                </select>
              ) : (
                <input
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  required
                />
              )}
            </label>
          ))}

          <div>
            <strong>Sadržaji (amenities)</strong>
            <div className="list compact">
              {contentsOptions.map((content) => {
                const checked = form.contentIds.includes(content.id);
                return (
                  <label key={content.id} className="list-item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const nextIds = e.target.checked
                          ? [...form.contentIds, content.id]
                          : form.contentIds.filter((id) => id !== content.id);
                        setForm((prev) => ({ ...prev, contentIds: nextIds }));
                      }}
                    />
                    {content.name}
                  </label>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={saving}>{saving ? 'Spremanje...' : 'Spremi promjene'}</button>
        </form>
      ) : (
        <div className="list compact">
          <article className="list-item">
            <h3>{apartment.title}</h3>
            <p>{apartment.description}</p>
            <p>{apartment.city}, {apartment.country}</p>
            <p>{apartment.address}</p>
            <p>Cijena: {apartment.pricePerNight} EUR / noć</p>
            <p>Max gostiju: {apartment.maxGuests} • Min noći: {apartment.minNights}</p>
            <p>Policy: {apartment.cancellationPolicy}</p>
            <p>Vlasnik: {apartment.owner?.firstName} {apartment.owner?.lastName}</p>
            <p>Prosječna ocjena: {apartment.avgRating ? apartment.avgRating.toFixed(2) : 'Nema ocjena'} ({apartment.reviewCount})</p>
            <p>
              Sadržaji:{' '}
              {(apartment.contents || []).map((item) => item.content?.name).filter(Boolean).join(', ') || 'Nema odabranih sadržaja'}
            </p>
          </article>

          {(apartment.reviews || []).map((review) => (
            <article key={review.id} className="list-item">
              <p><strong>{review.guest?.firstName} {review.guest?.lastName}</strong> — {formatDate(review.createdAt)}</p>
              <p>Ocjena: {review.rating}/5</p>
              <p>{review.comment}</p>
              {review.ownerReply ? <p><strong>Odgovor vlasnika:</strong> {review.ownerReply}</p> : null}
            </article>
          ))}
        </div>
      )}

      {!isOwner ? (
        <section className="card">
          <h3>Rezerviraj ovaj apartman</h3>
          <form onSubmit={reserveApartment} className="grid grid-4">
            <label>
              Check-in
              <input
                type="date"
                value={reservationForm.checkIn}
                onChange={(e) => setReservationForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                required
              />
            </label>
            <label>
              Check-out
              <input
                type="date"
                value={reservationForm.checkOut}
                onChange={(e) => setReservationForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                required
              />
            </label>
            <label>
              Broj gostiju
              <input
                type="number"
                min="1"
                value={reservationForm.numGuests}
                onChange={(e) => setReservationForm((prev) => ({ ...prev, numGuests: e.target.value }))}
                required
              />
            </label>
            <button type="submit" disabled={reserving}>{reserving ? 'Slanje...' : 'Pošalji rezervaciju'}</button>
            <button type="button" className="ghost" onClick={checkAvailability}>Provjeri dostupnost</button>
          </form>
        </section>
      ) : null}
    </section>
  );
}
