import { useLocation } from "wouter";

/**
 * A hook that provides a navigate function compatible with react-router-dom's useNavigate.
 * This is a compatibility layer for migrating from react-router-dom to wouter.
 */
export function useNavigate() {
  const [, setLocation] = useLocation();
  
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      // Handle back/forward navigation
      window.history.go(to);
    } else {
      setLocation(to, options);
    }
  };
}
