
import axios from "axios";
import { useEffect, useState } from "react";
import { Axios } from "../Api/Api";
import LoadingPage from "./LoadingPage";
import TrialExpiredPage from "../pages/Trialexpiredpage";

export default function ProtectedTrail({ children }) {
  const [trialLoading, setTrialLoading] = useState(true);
  const [trialEnded, setTrialEnded] = useState(false);

  useEffect(() => {
    const checkTrial = async () => {
      try {
        setTrialLoading(true);

        const response = await Axios.get("/trial");

        setTrialEnded(!response.data.active);
      } catch (error) {
        console.error("Trial check error:", error);

        // If backend explicitly says trial ended
        if (
          error.response?.status === 403 &&
          error.response?.data?.message === "Trial ended"
        ) {
          setTrialEnded(true);
        }
      } finally {
        setTrialLoading(false);
      }
    };

    checkTrial();
  }, []);

  if (trialLoading) {
    return <LoadingPage />;
  }

  if (trialEnded) {
    return <TrialExpiredPage />;
  }

  return children;
}
