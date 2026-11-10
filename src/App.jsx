import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./Home.jsx";
import MovieDetails from "./MovieDetails.jsx";

export default function App() {
  const [searchState, setSearchState] = useState({
    query: "",
    movies: [],
    loading: false,
    error: "",
  });
  const [sortOrder, setSortOrder] = useState("default");

  return (
    <Routes>
      <Route
        element={
          <Layout
            searchState={searchState}
            onSearchStateChange={setSearchState}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        }
      >
        <Route index element={<Home />} />
        <Route path=":imdbID" element={<MovieDetails />} />
        <Route path="movie/:imdbID" element={<MovieDetails />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
