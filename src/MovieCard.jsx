import React, { useState } from "react";

function Poster({ movie }) {
  const [unavailable, setUnavailable] = useState(
    !movie.Poster || movie.Poster === "N/A",
  );

  if (unavailable) {
    return (
      <div
        className="movie-card__poster-placeholder"
        role="img"
        aria-label={`Poster unavailable for ${movie.Title}`}
      >
        <span className="movie-card__poster-label">Poster unavailable</span>
      </div>
    );
  }

  return (
    <img
      className="movie-card__img"
      src={movie.Poster}
      alt={`${movie.Title} poster`}
      loading="lazy"
      onError={() => setUnavailable(true)}
    />
  );
}

export default function MovieCard({ movie, onSelect }) {
  return (
    <article className="movie-card">
      <button
        className="movie-card__action"
        type="button"
        onClick={() => onSelect(movie)}
        aria-label={`View details for ${movie.Title} (${movie.Year})`}
      >
        <Poster movie={movie} />
        <span className="movie-card__title">{movie.Title}</span>
        <span className="movie-card__year">{movie.Year}</span>
      </button>
    </article>
  );
}
