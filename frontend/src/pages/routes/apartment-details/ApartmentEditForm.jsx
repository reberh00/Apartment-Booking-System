import { editableKeys } from "./utils";
import AmenitiesSelector from "../../../components/AmenitiesSelector";

export default function ApartmentEditForm({
  form,
  setForm,
  saving,
  onSubmit,
  apartmentId,
}) {
  return (
    <form onSubmit={onSubmit} className="grid grid-3">
      {editableKeys.map((key) => (
        <label key={key}>
          {key}
          {key === "cancellationPolicy" ? (
            <select
              value={form[key]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [key]: e.target.value }))
              }
            >
              <option value="FLEXIBLE">FLEXIBLE</option>
              <option value="MODERATE">MODERATE</option>
              <option value="STRICT">STRICT</option>
            </select>
          ) : (
            <input
              value={form[key]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [key]: e.target.value }))
              }
              required
            />
          )}
        </label>
      ))}

      <AmenitiesSelector
        selectedIds={form.contentIds}
        onChange={(ids) => setForm((prev) => ({ ...prev, contentIds: ids }))}
        apartmentId={apartmentId}
      />

      <button type="submit" disabled={saving}>
        {saving ? "Spremanje..." : "Spremi promjene"}
      </button>
    </form>
  );
}
