import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/fes-logo.png";

const API_URL = "https://www.omdbapi.com/";
const API_KEY = import.meta.env.VITE_OMDB_API_KEY || "51de4c12";

function SearchIcon() {
  return (
    <svg
      className="search-form__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Nav({
  onSearchStateChange,
  onSortOrderChange,
  onClearSearch,
}) {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const searchController = useRef(null);
  const navigate = useNavigate();

  useEffect(() => () => searchController.current?.abort(), []);

  async function handleSearch(event) {
    event.preventDefault();
    const searchTerm = searchText.trim();
    if (!searchTerm) return;

    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setLoading(true);
    onSortOrderChange("default");
    onSearchStateChange({
      query: searchTerm,
      movies: [],
      loading: true,
      error: "",
    });
    navigate("/");

    try {
      const response = await fetch(
        `${API_URL}?s=${encodeURIComponent(searchTerm)}&apikey=${encodeURIComponent(API_KEY)}&type=movie`,
        { signal: controller.signal },
      );
      if (!response.ok) {
        throw new Error("The movie service is unavailable. Try again shortly.");
      }

      const data = await response.json();
      if (data.Response === "True") {
        onSearchStateChange({
          query: searchTerm,
          movies: data.Search || [],
          loading: false,
          error: "",
        });
      } else if (data.Error === "Movie not found!") {
        onSearchStateChange({
          query: searchTerm,
          movies: [],
          loading: false,
          error: "",
        });
      } else {
        throw new Error(data.Error || "Movie search failed.");
      }
    } catch (searchError) {
      if (searchError.name !== "AbortError") {
        onSearchStateChange({
          query: searchTerm,
          movies: [],
          loading: false,
          error:
            searchError.message ||
            "Could not load movies. Check your connection and try again.",
        });
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function handleHomeClick() {
    searchController.current?.abort();
    setLoading(false);
    onClearSearch();
    onSortOrderChange("default");
  }

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link
        className="logo"
        to="/"
        aria-label="Simplified Flix home"
        onClick={handleHomeClick}
      >
        <img
          src={logo}
          alt=""
          className="logo__img"
          width="34"
          height="34"
        />
        <span className="logo__title"><span>Simplified</span> Flix</span>
      </Link>
      <form className="search-form" onSubmit={handleSearch} role="search">
        <label className="visually-hidden" htmlFor="searchInput">
          Search movies
        </label>
        <div className="search-form__group">
          <input
            className="search-form__input"
            type="search"
            id="searchInput"
            placeholder="Search movies..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            required
          />
          <button
            className="search-form__button"
            type="submit"
            aria-label="Search"
            disabled={loading}
          >
            <SearchIcon />
          </button>
        </div>
      </form>
    </nav>
  );
}
