import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { GetClassResponse } from "@/lib/api";
import { getClassById } from "@/lib/api";

export const useClassData = (classId: string | undefined) => {
  const navigate = useNavigate();

  const [classData, setClassData] = useState<GetClassResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    if (!classId) return;

    const fetchClass = async () => {
      try {
        setLoading(true);
        const res = await getClassById(classId);
        setClassData(res.data);

        if (!res.data.isLive) {
          setSessionEnded(true);
          navigate("/dashboard");
        }
      } catch (err: unknown) {
        const errorMessage = (err as {
          response?: { data?: { message?: string } };
        })?.response?.data?.message;

        setError(errorMessage || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId, navigate]);

  return {
    classData,
    loading,
    error,
    sessionEnded,
  };
};