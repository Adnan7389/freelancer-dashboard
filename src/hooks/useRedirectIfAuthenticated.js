import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function useRedirectIfAuthenticated(redirectTo = "/dashboard") {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate(redirectTo);
    }
  }, [currentUser, navigate, redirectTo]);
}