import { useEffect, useState } from 'react';
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

export default function OwnerApartmentDetailsPage({ setFeedback, updateApartment, contentsOptions }) {
  const { apartmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadApartment() {
      try {
        setLoading(true);
        const apartment = await api.get(`/apartments/${apartmentId}`);
        if (ignore) return;

        setForm({
          title: apartment.title || '',
          description: apartment.description || '',
          city: apartment.city || '',
          country: apartment.country || '',
          address: apartment.address || '',
          latitude: apartment.latitude ?? '',
          longitude: apartment.longitude ?? '',
          pricePerNight: apartment.pricePerNight ?? '',
          maxGuests: apartment.maxGuests ?? '',
          minNights: apartment.minNights ?? '',
          cancellationPolicy: apartment.cancellationPolicy || 'FLEXIBLE',
          contentIds: (apartment.contents || []).map((item) => item.contentId || item.content?.id).filter(Boolean),
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
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="card">
        <h2>Učitavanje apartmana...</h2>
      </section>
    );
  }

  if (!form) {
    return (
      <section className="card">
        <h2>Apartman nije pronađen.</h2>
        <button type="button" onClick={() => navigate('/app/owner/apartments')}>Natrag na moje apartmane</button>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="row between">
        <h2>Uredi apartman</h2>
        <button type="button" className="ghost" onClick={() => navigate('/app/owner/apartments')}>Natrag</button>
      </div>

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
    </section>
  );
}
