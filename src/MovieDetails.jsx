import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const API_URL = "https://www.omdbapi.com/";
const API_KEY = import.meta.env.VITE_OMDB_API_KEY || "51de4c12";

function Poster({ movie }) {
  const [unavailable, setUnavailable] = useState(
    !movie.Poster || movie.Poster === "N/A",
  );

  if (unavailable) {
    return (
      <div
        className="movie-card__poster-placeholder movie-detail__poster"
        role="img"
        aria-label={`Poster unavailable for ${movie.Title}`}
      >
        <span className="movie-card__poster-label">Poster unavailable</span>
      </div>
    );
  }

  return (
    <img
      className="movie-card__img movie-detail__poster"
      src={movie.Poster}
      alt={`${movie.Title} poster`}
      onError={() => setUnavailable(true)}
    />
  );
}

export default function MovieDetails() {
  const { imdbID } = useParams();
  const location = useLocation();
  const initialMovie = location.state?.movie;
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setDetails(null);
    setError("");

    async function loadDetails() {
      try {
        const response = await fetch(
          `${API_URL}?i=${encodeURIComponent(imdbID)}&apikey=${encodeURIComponent(API_KEY)}&plot=full`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Movie details are unavailable. Please try again.");
        }

        const data = await response.json();
        if (data.Response !== "True") {
          throw new Error(data.Error || "Movie details could not be found.");
        }
        setDetails(data);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Could not load movie details.");
        }
      }
    }

    loadDetails();
    return () => controller.abort();
  }, [imdbID]);

  const movie = details || initialMovie;

  return (
    <section
      className="movie-detail"
      aria-labelledby={movie ? "detail-title" : undefined}
    >
      <Link className="back-button" to="/">
        <span aria-hidden="true">←</span> Back to movies
      </Link>
      {error ? (
        <p className="state-message state-message--error" role="alert">
          {error}
        </p>
      ) : !details ? (
        <div className="detail-loading" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Loading movie details...</span>
        </div>
      ) : (
        <div className="movie-detail__content">
          <Poster movie={movie} />
          <div className="movie-detail__copy">
            <p className="eyebrow">{details.Year} · {details.Rated}</p>
            <h1 id="detail-title">{details.Title}</h1>
            <p className="movie-detail__tagline">
              {details.Genre} · {details.Runtime}
            </p>
            <p className="movie-detail__plot">{details.Plot}</p>
            <dl className="movie-detail__facts">
              <div><dt>Director</dt><dd>{details.Director}</dd></div>
              <div><dt>Writer</dt><dd>{details.Writer}</dd></div>
              <div><dt>Cast</dt><dd>{details.Actors}</dd></div>
              <div><dt>Released</dt><dd>{details.Released}</dd></div>
              <div><dt>IMDb rating</dt><dd>{details.imdbRating}</dd></div>
              <div><dt>Awards</dt><dd>{details.Awards}</dd></div>
              <div><dt>Language</dt><dd>{details.Language}</dd></div>
              <div><dt>Country</dt><dd>{details.Country}</dd></div>
              <div><dt>Box office</dt><dd>{details.BoxOffice}</dd></div>
              {details.Ratings?.length ? (
                <div>
                  <dt>Other ratings</dt>
                  <dd>
                    {details.Ratings.map((rating) => (
                      <span key={rating.Source}>
                        {rating.Source}: {rating.Value}
                        <br />
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}
