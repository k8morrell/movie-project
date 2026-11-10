import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import MovieCard from "./MovieCard.jsx";

function movieYear(year) {
  const parsedYear = Number.parseInt(year, 10);
  return Number.isNaN(parsedYear) ? null : parsedYear;
}

function sortMovies(movies, sortOrder) {
  return [...movies].sort((first, second) => {
    if (sortOrder === "a-z") return first.Title.localeCompare(second.Title);
    if (sortOrder === "z-a") return second.Title.localeCompare(first.Title);

    if (sortOrder === "newest" || sortOrder === "oldest") {
      const firstYear = movieYear(first.Year);
      const secondYear = movieYear(second.Year);
      if (firstYear === null) return 1;
      if (secondYear === null) return -1;
      return sortOrder === "newest"
        ? secondYear - firstYear
        : firstYear - secondYear;
    }

    return 0;
  });
}

function MovieSkeleton() {
  return (
    <article className="movie-card movie-card--skeleton" aria-hidden="true">
      <div className="movie-card__img--skeleton" />
      <div className="movie-card__title--skeleton" />
      <div className="movie-card__year--skeleton" />
    </article>
  );
}

export default function Home() {
  const { query, movies, loading, error, sortOrder, onSortOrderChange } =
    useOutletContext();
  const navigate = useNavigate();
  const sortedMovies = sortMovies(movies, sortOrder);

  function openMovie(movie) {
    navigate(`/${encodeURIComponent(movie.imdbID)}`, {
      state: { movie },
    });
  }

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Your next movie night starts here</p>
        <h1 id="page-title">Find a film worth watching.</h1>
        <p>Search a world of movies and explore the stories behind them.</p>
      </section>
      <section className="results-section" aria-label="Movie search results">
        <div className="controls">
          <p id="resultsInfo" className="resultsInfo" aria-live="polite">
            {loading
              ? `Searching for: ${query}`
              : error
                ? "Search could not be completed."
                : query
                  ? movies.length
                    ? `${movies.length} results for: ${query}`
                    : `No movies found for: ${query}`
                  : "Search for a movie to get started."}
          </p>
          <div className="sort-control">
            <label htmlFor="sortSelect">Sort</label>
            <select
              id="sortSelect"
              value={sortOrder}
              onChange={(event) => onSortOrderChange(event.target.value)}
              disabled={movies.length === 0}
            >
              <option value="default">Relevance</option>
              <option value="a-z">Title: A–Z</option>
              <option value="z-a">Title: Z–A</option>
              <option value="newest">Year: newest</option>
              <option value="oldest">Year: oldest</option>
            </select>
          </div>
        </div>

        {error ? (
          <p className="state-message state-message--error" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && query && movies.length === 0 ? (
          <p className="state-message">Try another title or spelling.</p>
        ) : null}
        {!query && !loading ? (
          <div className="welcome-panel">
            <span className="welcome-panel__icon" aria-hidden="true">✦</span>
            <h2>What would you like to watch?</h2>
            <p>Search for a title, actor, or keyword to get started.</p>
          </div>
        ) : null}
        <div className="movies-grid" aria-busy={loading}>
          {loading
            ? Array.from({ length: 8 }, (_, index) => (
                <MovieSkeleton key={index} />
              ))
            : sortedMovies.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  onSelect={openMovie}
                />
              ))}
        </div>
      </section>
    </>
  );
}
