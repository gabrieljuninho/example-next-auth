"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import toast from "react-hot-toast";

import { verifyEmail } from "@/actions/verify-mail";

const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const router = useRouter();

  const handleSubmit = useCallback(async () => {
    if (success || error) return;

    setError(undefined);
    setSuccess(undefined);

    if (!token) {
      setError("Missing token!");

      return;
    }

    const promise = verifyEmail(token)
      .then((data) => {
        if (data.error) {
          setError(data.error);

          throw new Error(data.error);
        }

        setSuccess(data.success as string);

        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);

        return data.success;
      })
      .catch((error) => {
        setError("Something went wrong!");

        throw error;
      });

    toast.promise(promise, {
      loading: "Verifying...",
      success: "Verification successful!",
      error: "Verification failed!",
    });
  }, [token, success, error, router]);

  useEffect(() => {
    handleSubmit();
  }, [handleSubmit]);

  return (
    <div className="flex w-full items-center justify-center">
      {!success && !error && <p>Loading...</p>}
    </div>
  );
};

export default NewVerificationForm;
