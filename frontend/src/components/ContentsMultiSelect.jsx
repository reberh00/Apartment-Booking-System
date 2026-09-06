import { useEffect, useRef, useState } from "react";
import { useContents } from "../hooks/useContents";

/**
 * Multi-select dropdown for filtering apartments by amenities/contents.
 *
 * Only the shared "standard" content catalog (Content rows with
 * apartmentId === null) is offered here, not the one-off custom entries an
 * owner can attach to a single apartment. Custom entries are free-text and
 * apartment-specific, so they aren't meaningful as a cross-listing search
 * filter — showing them would clutter the dropdown with names that (almost
 * by definition) match at most one apartment.
 *
 * selectedIds/onChange follow the same controlled-array contract as
 * AmenitiesSelector, so the parent just keeps an array of Content ids in
 * state.
 */
export default function ContentsMultiSelect({ selectedIds, onChange }) {
  const { contentsOptions } = useContents();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(contentId) {
    const next = selectedIds.includes(contentId)
      ? selectedIds.filter((id) => id !== contentId)
      : [...selectedIds, contentId];
    onChange(next);
  }

  const selectedNames = contentsOptions
    .filter((content) => selectedIds.includes(content.id))
    .map((content) => content.name);

  const triggerLabel =
    selectedNames.length === 0
      ? "Svi sadržaji"
      : selectedNames.length <= 2
        ? selectedNames.join(", ")
        : `${selectedNames.length} sadržaja odabrano`;

  return (
    <div className="autocomplete multiselect" ref={containerRef}>
      <button
        type="button"
        className="ghost multiselect-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {triggerLabel}
      </button>
      {open ? (
        <ul className="autocomplete-list multiselect-list" role="listbox">
          {contentsOptions.length === 0 ? (
            <li className="autocomplete-item multiselect-empty">
              Nema dostupnih sadržaja
            </li>
          ) : (
            contentsOptions.map((content) => (
              <li key={content.id} className="autocomplete-item">
                <label className="multiselect-option">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(content.id)}
                    onChange={() => toggle(content.id)}
                  />
                  {content.name}
                </label>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
