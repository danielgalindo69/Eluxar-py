import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Resets window scroll to the top on every route change.
 * React Router does NOT do this automatically — the browser
 * maintains the previous scroll position when navigating.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};
