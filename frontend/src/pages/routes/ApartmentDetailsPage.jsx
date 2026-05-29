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

function formatCurrency(value) {
  return `${Number(value || 0).toFixed(2)} EUR`;
}

function StatsLineChart({ data, dataKey, stroke, title, formatter }) {
  const width = 680;
  const height = 220;
  const padding = 24;

  if (!data?.length) {
    return null;
  }

  const maxValue = Math.max(...data.map((item) => Number(item[dataKey] || 0)), 1);
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const numericValue = Number(item[dataKey] || 0);
    const x = padding + index * stepX;
    const y = height - padding - ((height - padding * 2) * (numericValue / maxValue));

    return {
      x,
      y,
      label: item.label,
      value: numericValue,
    };
  });

  const linePath = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="stats-chart-wrap">
      <h4>{title}</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="stats-chart" role="img" aria-label={title}>
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePath}
        />
        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="3" fill={stroke}>
            <title>{`${point.label}: ${formatter(point.value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="stats-chart-labels">
        {data.map((item, index) => (index % 2 === 0 || index === data.length - 1 ? (
          <span key={`${title}-${item.label}`}>{item.label}</span>
        ) : null))}
      </div>
    </div>
  );
}

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
  const [apartmentStats, setApartmentStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [reservationForm, setReservationForm] = useState({ checkIn: '', checkOut: '', numGuests: 1 });

  const isOwner = useMemo(() => {
    if (!user || !apartment) return false;
    return apartment.owner?.id === user.id;
  }, [user, apartment]);

  const canViewStats = useMemo(() => {
    if (!user || !apartment) return false;
    return user.role === 'ADMIN' || apartment.owner?.id === user.id;
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

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      if (!canViewStats || !token) {
        setApartmentStats(null);
        return;
      }

      try {
        setStatsLoading(true);
        const data = await api.get(`/apartments/${apartmentId}/stats`, token);

        if (ignore) return;
        setApartmentStats(data);
      } catch (err) {
        if (!ignore) {
          setFeedback(err.message, true);
        }
      } finally {
        if (!ignore) {
          setStatsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      ignore = true;
    };
  }, [apartmentId, canViewStats, setFeedback, token]);

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

          {canViewStats ? (
            <article className="list-item">
              <h3>Statistika apartmana</h3>
              {statsLoading ? <p>Učitavanje statistike...</p> : null}

              {!statsLoading && apartmentStats ? (
                <>
                  <div className="grid grid-4">
                    <div className="list-item">
                      <strong>Ukupno rezervacija</strong>
                      <p>{apartmentStats.totalReservations}</p>
                    </div>
                    <div className="list-item">
                      <strong>Realizirane rezervacije</strong>
                      <p>{apartmentStats.completedReservations}</p>
                    </div>
                    <div className="list-item">
                      <strong>Ukupan prihod</strong>
                      <p>{formatCurrency(apartmentStats.totalIncome)}</p>
                    </div>
                    <div className="list-item">
                      <strong>Na čekanju</strong>
                      <p>{apartmentStats.pendingReservations}</p>
                    </div>
                  </div>

                  <div className="stats-year-list">
                    <h4>Godišnje</h4>
                    <div className="list compact">
                      {apartmentStats.yearlyTrend.length ? apartmentStats.yearlyTrend.map((yearRow) => (
                        <div key={yearRow.label} className="list-item row between">
                          <span>{yearRow.label}</span>
                          <span>{yearRow.reservations} rezervacija • {formatCurrency(yearRow.income)}</span>
                        </div>
                      )) : (
                        <p className="meta">Nema realiziranih rezervacija.</p>
                      )}
                    </div>
                  </div>

                  <StatsLineChart
                    data={apartmentStats.monthlyTrend}
                    dataKey="income"
                    stroke="#2563eb"
                    title="Prihod po mjesecima (zadnjih 12 mjeseci)"
                    formatter={formatCurrency}
                  />
                  <StatsLineChart
                    data={apartmentStats.monthlyTrend}
                    dataKey="reservations"
                    stroke="#f97316"
                    title="Broj rezervacija po mjesecima (zadnjih 12 mjeseci)"
                    formatter={(value) => `${value} rezervacija`}
                  />
                </>
              ) : null}
            </article>
          ) : null}

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
