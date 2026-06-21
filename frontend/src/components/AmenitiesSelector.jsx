import { useState } from "react";
import { useContents } from "../hooks/useContents";
import { useFeedback } from "../context/FeedbackContext";

export default function AmenitiesSelector({
  selectedIds,
  onChange,
  apartmentId,
}) {
  const { contentsOptions, createContent, deleteContent } =
    useContents(apartmentId);
  const { setFeedback } = useFeedback();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle(contentId, checked) {
    const nextIds = checked
      ? [...selectedIds, contentId]
      : selectedIds.filter((id) => id !== contentId);
    onChange(nextIds);
  }

  async function addAmenity() {
    const name = newName.trim();
    if (!name) {
      return;
    }

    try {
      setSaving(true);
      const created = await createContent(name);
      if (!selectedIds.includes(created.id)) {
        onChange([...selectedIds, created.id]);
      }
      setNewName("");
      setAdding(false);
      setFeedback(`Sadržaj "${created.name}" je dodan.`);
    } catch (err) {
      setFeedback(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="row between">
        <strong>Sadržaji</strong>
        <button
          type="button"
          className="ghost"
          onClick={() => setAdding((prev) => !prev)}
        >
          {adding ? "Odustani" : "Dodaj sadržaj"}
        </button>
      </div>

      {adding ? (
        <div className="row gap" style={{ marginTop: "0.5rem" }}>
          <input
            value={newName}
            placeholder="Naziv sadržaja"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addAmenity();
              }
            }}
          />
          <button
            type="button"
            onClick={addAmenity}
            disabled={saving || !newName.trim()}
          >
            {saving ? "Dodavanje..." : "Dodaj"}
          </button>
        </div>
      ) : null}

      <div className="list compact">
        {contentsOptions.map((content) => {
          const checked = selectedIds.includes(content.id);
          return (
            <div key={content.id} className="list-item row between">
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggle(content.id, e.target.checked)}
                />
                {content.name}
              </label>
              {content.apartmentId ? (
                <button
                  type="button"
                  className="ghost"
                  onClick={async () => {
                    try {
                      await deleteContent(content.id);
                      if (selectedIds.includes(content.id)) {
                        onChange(selectedIds.filter((id) => id !== content.id));
                      }
                    } catch (err) {
                      setFeedback(err.message, true);
                    }
                  }}
                >
                  Ukloni
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
