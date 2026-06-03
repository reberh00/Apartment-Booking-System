import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { api, assetUrl } from '../../api';

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

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseDateFromInput(value) {
  if (!value) return null;
  const parsed = new Date(value);
  parsed.setHours(0, 0, 0, 0);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function calculateNights(checkIn, checkOut) {
  const from = parseDateFromInput(checkIn);
  const to = parseDateFromInput(checkOut);

  if (!from || !to || to <= from) {
    return 0;
  }

  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

function isDateInRange(date, range) {
  if (!range?.from || !range?.to) return false;
  return date >= range.from && date <= range.to;
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
  const [unavailableRanges, setUnavailableRanges] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [calendarSelectionMessage, setCalendarSelectionMessage] = useState('');
  const [ownerBlocking, setOwnerBlocking] = useState(false);
  const [ownerBlockRange, setOwnerBlockRange] = useState(undefined);
  const [ownerBlockMessage, setOwnerBlockMessage] = useState('');
  const [availabilityBlocks, setAvailabilityBlocks] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const photoInputRef = useRef(null);
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

  const selectedNights = useMemo(
    () => calculateNights(reservationForm.checkIn, reservationForm.checkOut),
    [reservationForm.checkIn, reservationForm.checkOut],
  );

  const estimatedTotal = useMemo(
    () => selectedNights * Number(apartment?.pricePerNight || 0),
    [apartment?.pricePerNight, selectedNights],
  );

  const selectedRange = useMemo(() => {
    const from = parseDateFromInput(reservationForm.checkIn);
    const to = parseDateFromInput(reservationForm.checkOut);

    if (!from) {
      return undefined;
    }

    if (!to) {
      return { from };
    }

    return { from, to };
  }, [reservationForm.checkIn, reservationForm.checkOut]);

  const disabledDateMatchers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rangeMatchers = unavailableRanges
      .map((range) => ({
        from: parseDateFromInput(range.from),
        to: parseDateFromInput(range.to),
      }))
      .filter((range) => range.from && range.to);

    return [{ before: today }, ...rangeMatchers];
  }, [unavailableRanges]);

  const canSubmitReservation = selectedNights >= Number(apartment?.minNights || 1);

  const canSubmitOwnerBlock = Boolean(ownerBlockRange?.from && ownerBlockRange?.to && token);

  const dayPriceHint = useMemo(() => {
    const nightly = Number(apartment?.pricePerNight || 0);
    if (!nightly) return '—';
    return `€${Math.round(nightly)}`;
  }, [apartment?.pricePerNight]);

  const ownerBlockStart = useMemo(
    () => (ownerBlockRange?.from ? formatDateInput(ownerBlockRange.from) : ''),
    [ownerBlockRange],
  );

  const ownerBlockEnd = useMemo(
    () => (ownerBlockRange?.to ? formatDateInput(ownerBlockRange.to) : ''),
    [ownerBlockRange],
  );

  const apartmentPhotos = useMemo(
    () => (apartment?.photos || []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
    [apartment?.photos],
  );

  function getAvailabilityWindowQuery() {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = addDays(from, 365);

    const params = new URLSearchParams({
      from: formatDateInput(from),
      to: formatDateInput(to),
    });

    return params.toString();
  }

  async function loadCalendarAvailabilityData() {
    setAvailabilityLoading(true);

    try {
      const query = getAvailabilityWindowQuery();
      const data = await api.get(`/apartments/${apartmentId}/calendar-availability?${query}`);
      setUnavailableRanges(data.unavailableRanges || []);
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function refreshApartmentDetails() {
    const refreshed = await api.get(`/apartments/${apartmentId}`);
    setApartment(refreshed);
  }

  async function addApartmentPhoto(e) {
    e.preventDefault();

    if (!token || !photoFile) {
      return;
    }

    try {
      setPhotoLoading(true);
      const formData = new FormData();
      formData.append('photo', photoFile);
      await api.upload(`/apartments/${apartmentId}/photos`, formData, token);
      setPhotoFile(null);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
      await refreshApartmentDetails();
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setPhotoLoading(false);
    }
  }

  async function deleteApartmentPhoto(photoId) {
    if (!token) {
      return;
    }

    try {
      setPhotoLoading(true);
      await api.del(`/apartments/${apartmentId}/photos/${photoId}`, token);
      await refreshApartmentDetails();
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setPhotoLoading(false);
    }
  }

  async function reorderApartmentPhoto(photoId, direction) {
    if (!token || apartmentPhotos.length < 2) {
      return;
    }

    const currentIndex = apartmentPhotos.findIndex((photo) => photo.id === photoId);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= apartmentPhotos.length) {
      return;
    }

    const ordered = apartmentPhotos.map((photo) => photo.id);
    const [moved] = ordered.splice(currentIndex, 1);
    ordered.splice(targetIndex, 0, moved);

    try {
      setPhotoLoading(true);
      await api.patch(`/apartments/${apartmentId}/photos/reorder`, { photoIds: ordered }, token);
      await refreshApartmentDetails();
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setPhotoLoading(false);
    }
  }

  async function loadOwnerAvailabilityBlocks() {
    if (!isOwner || !token) {
      setAvailabilityBlocks([]);
      return;
    }

    const blocks = await api.get(`/apartments/${apartmentId}/availability-blocks`, token);
    setAvailabilityBlocks(blocks || []);
  }

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

  useEffect(() => {
    let ignore = false;

    async function loadCalendarAvailability() {
      try {
        await loadCalendarAvailabilityData();

        if (ignore) return;
      } catch (err) {
        if (!ignore) {
          setFeedback(err.message, true);
        }
      }
    }

    void loadCalendarAvailability();

    return () => {
      ignore = true;
    };
  }, [apartmentId, setFeedback]);

  useEffect(() => {
    let ignore = false;

    async function loadOwnerBlocks() {
      try {
        await loadOwnerAvailabilityBlocks();
      } catch (err) {
        if (!ignore) {
          setFeedback(err.message, true);
        }
      }
    }

    void loadOwnerBlocks();

    return () => {
      ignore = true;
    };
  }, [apartmentId, isOwner, setFeedback, token]);

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
      setCalendarSelectionMessage('');
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setReserving(false);
    }
  }

  async function createOwnerAvailabilityBlock(e) {
    e.preventDefault();

    if (!token) {
      setFeedback('Za blokiranje termina morate biti prijavljeni kao vlasnik.', true);
      return;
    }

    if (!ownerBlockRange?.from || !ownerBlockRange?.to) {
      setOwnerBlockMessage('Odaberite početni i završni datum za blokadu.');
      return;
    }

    try {
      setOwnerBlocking(true);
      const payload = {
        startDate: formatDateInput(ownerBlockRange.from),
        endDate: formatDateInput(addDays(ownerBlockRange.to, 1)),
      };

      await api.post(`/apartments/${apartmentId}/availability-blocks`, payload, token);
      setOwnerBlockRange(undefined);
      setOwnerBlockMessage('Termin je uspješno blokiran.');
      await Promise.all([loadCalendarAvailabilityData(), loadOwnerAvailabilityBlocks()]);
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setOwnerBlocking(false);
    }
  }

  async function deleteOwnerAvailabilityBlock(blockId) {
    if (!token) {
      return;
    }

    try {
      await api.del(`/apartments/${apartmentId}/availability-blocks/${blockId}`, token);
      setOwnerBlockMessage('Blokada termina je obrisana.');
      await Promise.all([loadCalendarAvailabilityData(), loadOwnerAvailabilityBlocks()]);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  function hasBlockedDatesInsideRange(fromDate, toDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(toDate);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      if (cursor < today) {
        return true;
      }

      const isUnavailable = unavailableRanges.some((range) => {
        const rangeStart = parseDateFromInput(range.from);
        const rangeEnd = parseDateFromInput(range.to);
        return rangeStart && rangeEnd && cursor >= rangeStart && cursor <= rangeEnd;
      });

      if (isUnavailable) {
        return true;
      }
    }

    return false;
  }

  function handleDayClick(day, modifiers) {
    if (!modifiers?.disabled) {
      return;
    }

    setCalendarSelectionMessage('Odabrani datum nije dostupan. Molimo odaberite drugi raspon.');
  }

  function handleRangeSelect(range) {
    if (!range?.from) {
      setReservationForm((prev) => ({ ...prev, checkIn: '', checkOut: '' }));
      setCalendarSelectionMessage('');
      return;
    }

    if (range.to && hasBlockedDatesInsideRange(range.from, range.to)) {
      setCalendarSelectionMessage('Raspon uključuje nedostupne datume. Odaberite drugi raspon.');
      setReservationForm((prev) => ({
        ...prev,
        checkIn: formatDateInput(range.from),
        checkOut: '',
      }));
      return;
    }

    setCalendarSelectionMessage('');

    setReservationForm((prev) => ({
      ...prev,
      checkIn: formatDateInput(range.from),
      checkOut: range.to ? formatDateInput(range.to) : '',
    }));
  }

  function handleOwnerBlockDayClick(day, modifiers) {
    if (!modifiers?.disabled) {
      return;
    }

    setOwnerBlockMessage('Taj datum nije moguće blokirati jer je već zauzet ili blokiran.');
  }

  function handleOwnerBlockRangeSelect(range) {
    if (!range?.from) {
      setOwnerBlockRange(undefined);
      setOwnerBlockMessage('');
      return;
    }

    if (range.to && hasBlockedDatesInsideRange(range.from, range.to)) {
      setOwnerBlockRange({ from: range.from });
      setOwnerBlockMessage('Raspon uključuje zauzete ili već blokirane datume. Odaberite drugi raspon.');
      return;
    }

    setOwnerBlockRange(range);
    setOwnerBlockMessage('');
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

      <section className="apartment-photos-strip">
        {apartmentPhotos.length ? apartmentPhotos.map((photo) => (
          <img key={photo.id} src={assetUrl(photo.url)} alt={apartment.title} className="apartment-photo" />
        )) : (
          <div className="apartment-photo apartment-photo-placeholder">Nema fotografija apartmana</div>
        )}
      </section>

      {isOwner ? (
        <section className="card">
          <h3>Fotografije apartmana</h3>
          <form onSubmit={addApartmentPhoto} className="row gap">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
            <button type="submit" disabled={photoLoading || !photoFile}>
              {photoLoading ? 'Prijenos...' : 'Učitaj fotografiju'}
            </button>
          </form>
          <p className="meta">Podržani formati: JPEG, PNG, WebP, GIF. Maksimalno 5 MB. Prva fotografija se prikazuje kao naslovna.</p>

          <div className="list compact owner-photo-list">
            {apartmentPhotos.length ? apartmentPhotos.map((photo, index) => (
              <article key={photo.id} className="list-item row between">
                <div className="row gap">
                  <img src={assetUrl(photo.url)} alt={`${apartment.title} ${index + 1}`} className="owner-photo-thumb" />
                  <span className="meta">#{index + 1}</span>
                </div>
                <div className="row gap">
                  <button
                    type="button"
                    className="ghost"
                    disabled={photoLoading || index === 0}
                    onClick={() => reorderApartmentPhoto(photo.id, 'up')}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    disabled={photoLoading || index === apartmentPhotos.length - 1}
                    onClick={() => reorderApartmentPhoto(photo.id, 'down')}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    disabled={photoLoading}
                    onClick={() => deleteApartmentPhoto(photo.id)}
                  >
                    Obriši
                  </button>
                </div>
              </article>
            )) : (
              <p className="meta">Nema učitanih fotografija.</p>
            )}
          </div>
        </section>
      ) : null}

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

      {isOwner ? (
        <section className="card">
          <h3>Blokiranje termina za vlasnika</h3>
          <div className="reservation-calendar-wrap">
            <DayPicker
              mode="range"
              selected={ownerBlockRange}
              onSelect={handleOwnerBlockRangeSelect}
              onDayClick={handleOwnerBlockDayClick}
              numberOfMonths={2}
              disabled={disabledDateMatchers}
              excludeDisabled
            />
            {availabilityLoading ? <p className="meta">Učitavanje dostupnosti...</p> : null}
            <p className="meta">Odaberite raspon datuma koji želite blokirati za nove rezervacije.</p>
            {ownerBlockMessage ? <p className="meta">{ownerBlockMessage}</p> : null}
          </div>

          <form onSubmit={createOwnerAvailabilityBlock} className="grid grid-4">
            <label>
              Početak blokade
              <input
                type="text"
                value={ownerBlockStart}
                readOnly
                placeholder="Odaberite na kalendaru"
                required
              />
            </label>
            <label>
              Kraj blokade
              <input
                type="text"
                value={ownerBlockEnd}
                readOnly
                placeholder="Odaberite na kalendaru"
                required
              />
            </label>
            <button type="submit" disabled={ownerBlocking || !canSubmitOwnerBlock}>
              {ownerBlocking ? 'Blokiranje...' : 'Blokiraj termin'}
            </button>
          </form>

          <div className="list compact owner-blocks-list">
            {availabilityBlocks.length ? availabilityBlocks.map((block) => (
              <article key={block.id} className="list-item row between">
                <div>
                  <strong>{formatDate(block.startDate)} - {formatDate(addDays(new Date(block.endDate), -1))}</strong>
                </div>
                <button type="button" className="ghost" onClick={() => deleteOwnerAvailabilityBlock(block.id)}>
                  Ukloni blokadu
                </button>
              </article>
            )) : (
              <p className="meta">Nema blokiranih termina.</p>
            )}
          </div>
        </section>
      ) : null}

      {!isOwner ? (
        <section className="card">
          <h3>Rezerviraj ovaj apartman</h3>
          <div className="reservation-calendar-wrap">
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={handleRangeSelect}
              onDayClick={handleDayClick}
              numberOfMonths={2}
              disabled={disabledDateMatchers}
              min={Number(apartment.minNights || 1)}
              excludeDisabled
              components={{
                DayContent: ({ date }) => {
                  const isSelected = isDateInRange(date, selectedRange);
                  return (
                    <span className={`calendar-day-content ${isSelected ? 'calendar-day-selected' : ''}`}>
                      <span>{date.getDate()}</span>
                      <span className="calendar-day-price">{dayPriceHint}</span>
                    </span>
                  );
                },
              }}
            />
            {availabilityLoading ? <p className="meta">Učitavanje nedostupnih termina...</p> : null}
            <p className="meta">Nedostupni termini su označeni i ne mogu se odabrati.</p>
            {calendarSelectionMessage ? <p className="meta">{calendarSelectionMessage}</p> : null}
          </div>

          <form onSubmit={reserveApartment} className="grid grid-4">
            <label>
              Check-in
              <input
                type="text"
                value={reservationForm.checkIn}
                readOnly
                placeholder="Odaberite na kalendaru"
                required
              />
            </label>
            <label>
              Check-out
              <input
                type="text"
                value={reservationForm.checkOut}
                readOnly
                placeholder="Odaberite na kalendaru"
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
            <button type="submit" disabled={reserving || !canSubmitReservation}>
              {reserving ? 'Slanje...' : 'Pošalji rezervaciju'}
            </button>
            <div className="reservation-summary">
              <p><strong>Noćenja:</strong> {selectedNights}</p>
              <p><strong>Procijenjeni iznos:</strong> {formatCurrency(estimatedTotal)}</p>
              {selectedNights > 0 && selectedNights < Number(apartment.minNights || 1) ? (
                <p className="meta">Minimalni boravak za ovaj apartman je {apartment.minNights} noći.</p>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}
    </section>
  );
}
