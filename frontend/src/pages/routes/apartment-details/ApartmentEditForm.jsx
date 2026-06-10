import { editableKeys } from "./utils";

export default function ApartmentEditForm({
  form,
  setForm,
  contentsOptions,
  saving,
  onSubmit,
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

      <button type="submit" disabled={saving}>
        {saving ? "Spremanje..." : "Spremi promjene"}
      </button>
    </form>
  );
}
