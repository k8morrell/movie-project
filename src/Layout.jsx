import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "./Nav.jsx";
import "../style.css";

export default function Layout({
  searchState,
  onSearchStateChange,
  sortOrder,
  onSortOrderChange,
}) {
  return (
    <div className="site-shell">
      <Nav
        onSearchStateChange={onSearchStateChange}
        onSortOrderChange={onSortOrderChange}
        onClearSearch={() =>
          onSearchStateChange({
            query: "",
            movies: [],
            loading: false,
            error: "",
          })
        }
      />
      <main>
        <Outlet context={{ ...searchState, sortOrder, onSortOrderChange }} />
      </main>
      <footer>
        <p>Created by C and KM. Powered by OMDb API.</p>
      </footer>
    </div>
  );
}
