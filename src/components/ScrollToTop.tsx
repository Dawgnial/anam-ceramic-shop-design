import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Only scroll to top on PUSH navigation (new page)
    // Don't scroll on POP (back/forward button)
    if (navigationType === "PUSH" && pathname !== prevPathname.current) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    prevPathname.current = pathname;
  }, [pathname, navigationType]);

  return null;
};
