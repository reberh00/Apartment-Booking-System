import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AddressAutocomplete({
  onSelect,
  placeholder = "Pretraži adresu, grad ili državu...",
  initialValue = "",
}) {
  const { token } = useAuth();
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return undefined;
    }

    let ignore = false;
    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await api.get(
          `/geocode/search?q=${encodeURIComponent(query)}`,
          token,
        );
        if (!ignore) {
          setResults(data.results || []);
          setOpen(true);
        }
      } catch {
        if (!ignore) {
          setResults([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [query, token]);

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

  function handlePick(result) {
    onSelect?.(result);
    setQuery(result.label);
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="autocomplete">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {loading ? <span className="autocomplete-hint">Pretraga...</span> : null}
      {open && results.length > 0 ? (
        <ul className="autocomplete-list">
          {results.map((result) => (
            <li key={result.placeId || result.label}>
              <button
                type="button"
                onClick={() => handlePick(result)}
                className="autocomplete-item"
              >
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
