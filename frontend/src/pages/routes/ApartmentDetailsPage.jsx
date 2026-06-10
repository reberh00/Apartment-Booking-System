import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "react-day-picker/style.css";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useFeedback } from "../../context/FeedbackContext";
import { useContents } from "../../hooks/useContents";
import ApartmentPhotosStrip from "./apartment-details/ApartmentPhotosStrip";
import OwnerPhotoManager from "./apartment-details/OwnerPhotoManager";
import ApartmentEditForm from "./apartment-details/ApartmentEditForm";
import ApartmentInfo from "./apartment-details/ApartmentInfo";
import OwnerBlockManager from "./apartment-details/OwnerBlockManager";
import ReservationForm from "./apartment-details/ReservationForm";
import {
  addDays,
  calculateNights,
  formatDateInput,
  parseDateFromInput,
} from "./apartment-details/utils";

export default function ApartmentDetailsPage({ defaultBackPath }) {
  const { user, token } = useAuth();
  const { setFeedback } = useFeedback();
  const { apartmentId } = useParams();
  const navigate = useNavigate();
  const { contentsOptions } = useContents();

  async function updateApartment(id, payload) {
    try {
      await api.put(`/apartments/${id}`, payload, token);
      setFeedback("Detalji apartmana su spremljeni.");
    } catch (err) {
      setFeedback(err.message, true);
      throw err;
    }
  }

  async function createReservationForApartment(id, payload) {
    try {
      await api.post(
        "/reservations",
        {
          apartmentId: id,
          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
          numGuests: Number(payload.numGuests),
        },
        token,
      );
      setFeedback("Rezervacija je poslana vlasniku.");
    } catch (err) {
      setFeedback(err.message, true);
      throw err;
    }
  }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [apartment, setApartment] = useState(null);
  const [apartmentStats, setApartmentStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [unavailableRanges, setUnavailableRanges] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [calendarSelectionMessage, setCalendarSelectionMessage] = useState("");
  const [ownerBlocking, setOwnerBlocking] = useState(false);
  const [ownerBlockRange, setOwnerBlockRange] = useState(undefined);
  const [ownerBlockMessage, setOwnerBlockMessage] = useState("");
  const [availabilityBlocks, setAvailabilityBlocks] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const photoInputRef = useRef(null);
  const [form, setForm] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    checkIn: "",
    checkOut: "",
    numGuests: 1,
  });

  const isOwner = useMemo(() => {
    if (!user || !apartment) return false;
    return apartment.owner?.id === user.id;
  }, [user, apartment]);

  const canViewStats = useMemo(() => {
    if (!user || !apartment) return false;
    return user.role === "ADMIN" || apartment.owner?.id === user.id;
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

  const canSubmitReservation =
    selectedNights >= Number(apartment?.minNights || 1);

  const canSubmitOwnerBlock = Boolean(
    ownerBlockRange?.from && ownerBlockRange?.to && token,
  );

  const dayPriceHint = useMemo(() => {
    const nightly = Number(apartment?.pricePerNight || 0);
    if (!nightly) return "—";
    return `€${Math.round(nightly)}`;
  }, [apartment?.pricePerNight]);

  const ownerBlockStart = useMemo(
    () => (ownerBlockRange?.from ? formatDateInput(ownerBlockRange.from) : ""),
    [ownerBlockRange],
  );

  const ownerBlockEnd = useMemo(
    () => (ownerBlockRange?.to ? formatDateInput(ownerBlockRange.to) : ""),
    [ownerBlockRange],
  );

  const apartmentPhotos = useMemo(
    () =>
      (apartment?.photos || [])
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder),
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
      const data = await api.get(
        `/apartments/${apartmentId}/calendar-availability?${query}`,
      );
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
      formData.append("photo", photoFile);
      await api.upload(`/apartments/${apartmentId}/photos`, formData, token);
      setPhotoFile(null);
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
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

    const currentIndex = apartmentPhotos.findIndex(
      (photo) => photo.id === photoId,
    );
    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= apartmentPhotos.length) {
      return;
    }

    const ordered = apartmentPhotos.map((photo) => photo.id);
    const [moved] = ordered.splice(currentIndex, 1);
    ordered.splice(targetIndex, 0, moved);

    try {
      setPhotoLoading(true);
      await api.patch(
        `/apartments/${apartmentId}/photos/reorder`,
        { photoIds: ordered },
        token,
      );
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

    const blocks = await api.get(
      `/apartments/${apartmentId}/availability-blocks`,
      token,
    );
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
          title: data.title || "",
          description: data.description || "",
          city: data.city || "",
          country: data.country || "",
          address: data.address || "",
          latitude: data.latitude ?? "",
          longitude: data.longitude ?? "",
          pricePerNight: data.pricePerNight ?? "",
          maxGuests: data.maxGuests ?? "",
          minNights: data.minNights ?? "",
          cancellationPolicy: data.cancellationPolicy || "FLEXIBLE",
          contentIds: (data.contents || [])
            .map((item) => item.contentId || item.content?.id)
            .filter(Boolean),
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
      setFeedback("Za rezervaciju se morate prijaviti.", true);
      return;
    }

    try {
      setReserving(true);
      await createReservationForApartment(apartmentId, reservationForm);
      setReservationForm({ checkIn: "", checkOut: "", numGuests: 1 });
      setCalendarSelectionMessage("");
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setReserving(false);
    }
  }

  async function createOwnerAvailabilityBlock(e) {
    e.preventDefault();

    if (!token) {
      setFeedback(
        "Za blokiranje termina morate biti prijavljeni kao vlasnik.",
        true,
      );
      return;
    }

    if (!ownerBlockRange?.from || !ownerBlockRange?.to) {
      setOwnerBlockMessage("Odaberite početni i završni datum za blokadu.");
      return;
    }

    try {
      setOwnerBlocking(true);
      const payload = {
        startDate: formatDateInput(ownerBlockRange.from),
        endDate: formatDateInput(addDays(ownerBlockRange.to, 1)),
      };

      await api.post(
        `/apartments/${apartmentId}/availability-blocks`,
        payload,
        token,
      );
      setOwnerBlockRange(undefined);
      setOwnerBlockMessage("Termin je uspješno blokiran.");
      await Promise.all([
        loadCalendarAvailabilityData(),
        loadOwnerAvailabilityBlocks(),
      ]);
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
      await api.del(
        `/apartments/${apartmentId}/availability-blocks/${blockId}`,
        token,
      );
      setOwnerBlockMessage("Blokada termina je obrisana.");
      await Promise.all([
        loadCalendarAvailabilityData(),
        loadOwnerAvailabilityBlocks(),
      ]);
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

    for (
      let cursor = new Date(start);
      cursor <= end;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      if (cursor < today) {
        return true;
      }

      const isUnavailable = unavailableRanges.some((range) => {
        const rangeStart = parseDateFromInput(range.from);
        const rangeEnd = parseDateFromInput(range.to);
        return (
          rangeStart && rangeEnd && cursor >= rangeStart && cursor <= rangeEnd
        );
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

    setCalendarSelectionMessage(
      "Odabrani datum nije dostupan. Molimo odaberite drugi raspon.",
    );
  }

  function handleRangeSelect(range) {
    if (!range?.from) {
      setReservationForm((prev) => ({ ...prev, checkIn: "", checkOut: "" }));
      setCalendarSelectionMessage("");
      return;
    }

    if (range.to && hasBlockedDatesInsideRange(range.from, range.to)) {
      setCalendarSelectionMessage(
        "Raspon uključuje nedostupne datume. Odaberite drugi raspon.",
      );
      setReservationForm((prev) => ({
        ...prev,
        checkIn: formatDateInput(range.from),
        checkOut: "",
      }));
      return;
    }

    setCalendarSelectionMessage("");

    setReservationForm((prev) => ({
      ...prev,
      checkIn: formatDateInput(range.from),
      checkOut: range.to ? formatDateInput(range.to) : "",
    }));
  }

  function handleOwnerBlockDayClick(day, modifiers) {
    if (!modifiers?.disabled) {
      return;
    }

    setOwnerBlockMessage(
      "Taj datum nije moguće blokirati jer je već zauzet ili blokiran.",
    );
  }

  function handleOwnerBlockRangeSelect(range) {
    if (!range?.from) {
      setOwnerBlockRange(undefined);
      setOwnerBlockMessage("");
      return;
    }

    if (range.to && hasBlockedDatesInsideRange(range.from, range.to)) {
      setOwnerBlockRange({ from: range.from });
      setOwnerBlockMessage(
        "Raspon uključuje zauzete ili već blokirane datume. Odaberite drugi raspon.",
      );
      return;
    }

    setOwnerBlockRange(range);
    setOwnerBlockMessage("");
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
            <button type="button" onClick={() => setEditMode(true)}>
              Uredi
            </button>
          ) : null}
          {isOwner && editMode ? (
            <button
              type="button"
              className="ghost"
              onClick={() => setEditMode(false)}
            >
              Odustani
            </button>
          ) : null}
          <button
            type="button"
            className="ghost"
            onClick={() => navigate(defaultBackPath)}
          >
            Natrag
          </button>
        </div>
      </div>

      <ApartmentPhotosStrip photos={apartmentPhotos} title={apartment.title} />

      {isOwner ? (
        <OwnerPhotoManager
          photos={apartmentPhotos}
          title={apartment.title}
          photoInputRef={photoInputRef}
          photoFile={photoFile}
          photoLoading={photoLoading}
          setPhotoFile={setPhotoFile}
          onSubmit={addApartmentPhoto}
          onReorder={reorderApartmentPhoto}
          onDelete={deleteApartmentPhoto}
        />
      ) : null}

      {editMode && isOwner ? (
        <ApartmentEditForm
          form={form}
          setForm={setForm}
          contentsOptions={contentsOptions}
          saving={saving}
          onSubmit={saveApartment}
        />
      ) : (
        <ApartmentInfo
          apartment={apartment}
          canViewStats={canViewStats}
          statsLoading={statsLoading}
          apartmentStats={apartmentStats}
        />
      )}

      {isOwner ? (
        <OwnerBlockManager
          ownerBlockRange={ownerBlockRange}
          onRangeSelect={handleOwnerBlockRangeSelect}
          onDayClick={handleOwnerBlockDayClick}
          disabledDateMatchers={disabledDateMatchers}
          availabilityLoading={availabilityLoading}
          ownerBlockMessage={ownerBlockMessage}
          onSubmit={createOwnerAvailabilityBlock}
          ownerBlockStart={ownerBlockStart}
          ownerBlockEnd={ownerBlockEnd}
          ownerBlocking={ownerBlocking}
          canSubmitOwnerBlock={canSubmitOwnerBlock}
          availabilityBlocks={availabilityBlocks}
          onDeleteBlock={deleteOwnerAvailabilityBlock}
        />
      ) : null}

      {!isOwner ? (
        <ReservationForm
          selectedRange={selectedRange}
          onRangeSelect={handleRangeSelect}
          onDayClick={handleDayClick}
          disabledDateMatchers={disabledDateMatchers}
          apartment={apartment}
          dayPriceHint={dayPriceHint}
          availabilityLoading={availabilityLoading}
          calendarSelectionMessage={calendarSelectionMessage}
          onSubmit={reserveApartment}
          reservationForm={reservationForm}
          setReservationForm={setReservationForm}
          reserving={reserving}
          canSubmitReservation={canSubmitReservation}
          selectedNights={selectedNights}
          estimatedTotal={estimatedTotal}
        />
      ) : null}
    </section>
  );
}
