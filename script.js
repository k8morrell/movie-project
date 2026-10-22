const API_KEY = "51de4c12";

// defined variables
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const moviesGrid = document.querySelector("#moviesGrid");
const resultsInfo = document.querySelector("#resultsInfo");
const sortSelect = document.querySelector("#sortSelect");
const searchButton = searchForm.querySelector('button[type="submit"]');

let currentMovies = [];
let latestSearchId = 0;
moviesGrid.replaceChildren();

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    fetchMovies(searchTerm);
  }
});

async function fetchMovies(searchTerm) {
  const searchId = ++latestSearchId;
  resultsInfo.textContent = `Searching for: ${searchTerm}`;
  showLoadingSpinner();
  moviesGrid.setAttribute("aria-busy", "true");
  searchButton.disabled = true;

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`,
    );
    if (!response.ok) {
      throw new Error("The movie service is unavailable. Try again shortly.");
    }

    const data = await response.json();
    if (searchId !== latestSearchId) return;

    if (data.Response === "True") {
      currentMovies = data.Search;
      resultsInfo.textContent = `Results for: ${searchTerm}`;
      sortSelect.value = "default";
      displayMovies(currentMovies);
    } else {
      currentMovies = [];
      resultsInfo.textContent =
        data.Error === "Movie not found!"
          ? `No movies found for: ${searchTerm}`
          : `Search failed: ${data.Error}`;
      moviesGrid.innerHTML = "<p>No movie results to display.</p>";
    }
  } catch (error) {
    if (searchId !== latestSearchId) return;
    currentMovies = [];
    resultsInfo.textContent =
      error.message ||
      "Could not load movies. Check your connection and try again.";
    moviesGrid.innerHTML = "";
  } finally {
    if (searchId === latestSearchId) {
      moviesGrid.setAttribute("aria-busy", "false");
      searchButton.disabled = false;
    }
  }
}

function showLoadingSpinner() {
  const loadingState = document.createElement("div");
  loadingState.className = "loading-state";
  loadingState.setAttribute("role", "status");

  const spinner = document.createElement("span");
  spinner.className = "loading-spinner";
  spinner.setAttribute("aria-hidden", "true");

  const message = document.createElement("span");
  message.textContent = "Loading movies...";

  loadingState.append(spinner, message);
  moviesGrid.replaceChildren(loadingState);
}

sortSelect.addEventListener("change", () => {
  const sortedMovies = [...currentMovies];
  if (sortSelect.value === "a-z") {
    sortedMovies.sort((first, second) =>
      first.Title.localeCompare(second.Title),
    );
  } else if (sortSelect.value === "z-a") {
    sortedMovies.sort((first, second) =>
      second.Title.localeCompare(first.Title),
    );
  } else if (sortSelect.value === "newest") {
    sortedMovies.sort(
      (first, second) =>
        Number.parseInt(second.Year, 10) - Number.parseInt(first.Year, 10),
    );
  } else if (sortSelect.value === "oldest") {
    sortedMovies.sort(
      (first, second) =>
        Number.parseInt(first.Year, 10) - Number.parseInt(second.Year, 10),
    );
  }
  displayMovies(sortedMovies);
});

function displayMovies(movies) {
  moviesGrid.replaceChildren(
    ...movies.map((movie) => {
      const card = document.createElement("article");
      card.className = "movie-card";

      if (movie.Poster && movie.Poster !== "N/A") {
        const poster = document.createElement("img");
        poster.className = "movie-card__img";
        poster.src = movie.Poster;
        poster.alt = `${movie.Title} poster`;
        poster.loading = "lazy";
        poster.addEventListener(
          "error",
          () => {
            poster.replaceWith(createPosterPlaceholder(movie.Title));
          },
          { once: true },
        );
        card.append(poster);
      } else {
        card.append(createPosterPlaceholder(movie.Title));
      }

      const title = document.createElement("h2");
      title.className = "movie-card__title";
      title.textContent = movie.Title;

      const year = document.createElement("p");
      year.className = "movie-card__year";
      year.textContent = movie.Year;

      card.append(title, year);
      return card;
    }),
  );
}

function createPosterPlaceholder(title) {
  const placeholder = document.createElement("div");
  placeholder.className = "movie-card__poster-placeholder";
  placeholder.setAttribute("role", "img");
  placeholder.setAttribute("aria-label", `Poster unavailable for ${title}`);

  const skeleton = document.createElement("div");
  skeleton.className = "movie-card__poster-skeleton";
  skeleton.setAttribute("aria-hidden", "true");
  skeleton.innerHTML =
    '<span class="poster-skeleton__head"></span><span class="poster-skeleton__body"></span><span class="poster-skeleton__line"></span><span class="poster-skeleton__line poster-skeleton__line--short"></span>';

  const label = document.createElement("span");
  label.className = "movie-card__poster-label";
  label.textContent = "Poster unavailable";

  placeholder.append(skeleton, label);
  return placeholder;
}
