"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const suggestionsMap = [
  {
    label: "Salary Advance",
    value: "salary advance",
    link: "/dashboard/make-request/advances",
  },
  {
    label: "Operational Advance",
    value: "operational advance",
    link: "/dashboard/make-request/advances",
  },
  {
    label: "Travel Advance",
    value: "travel advance",
    link: "/dashboard/make-request/advances",
  },
  {
    label: "Advances",
    value: "advances",
    link: "/dashboard/make-request/advances",
  },
  { label: "Loan", value: "loan", link: "/dashboard/make-request/advances" },
];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    typeof suggestionsMap
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const match = suggestionsMap.find((item) =>
      query.toLowerCase().includes(item.value)
    );
    if (match) {
      router.push(match.link);
    } else {
      alert("No matching section found.");
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.trim() === "") {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      return;
    }

    const matches = suggestionsMap.filter((item) =>
      item.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(matches);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (item: (typeof suggestionsMap)[0]) => {
    router.push(item.link);
  };

  return (
    <li className="hide-phone app-search position-relative">
      <form role="search" onSubmit={handleSearch}>
        <input
          type="search"
          name="search"
          className="form-control top-search mb-0"
          placeholder="Search here..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          autoComplete="off"
        />
        <button type="submit">
          <i className="iconoir-search"></i>
        </button>
      </form>

      {showSuggestions && (
        <ul
          className="list-group position-absolute bg-white border mt-1 w-100"
          style={{ zIndex: 10 }}
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item, idx) => (
              <li
                key={idx}
                className="list-group-item list-group-item-action cursor-pointer"
                onClick={() => handleSuggestionClick(item)}
              >
                {item.label}
              </li>
            ))
          ) : (
            <li className="list-group-item text-muted">No match found</li>
          )}
        </ul>
      )}
    </li>
  );
}
