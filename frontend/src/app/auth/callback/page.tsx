"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const REDIRECT_URI = "http://localhost:3000/auth/callback";
const CLIENT_ID = "drls-public";

function CallbackHandler() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("Completing authorization…");

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
      setStatus("error");
      setMessage(`Authorization was denied: ${error}`);
      return;
    }

    if (!code || !state) {
      setStatus("error");
      setMessage("Missing authorization code or state parameter.");
      return;
    }

    const url = new URL(`${API}/api/auth/callback`);
    url.searchParams.set("code", code);
    url.searchParams.set("state", state);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("client_id", CLIENT_ID);

    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Authorization complete. You can close this window and retry your search.");
        } else {
          setStatus("error");
          setMessage(data.detail || "Token exchange failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not reach the dRLS backend.");
      });
  }, [params]);

  const colors = {
    pending: "text-blue-700 bg-blue-50 border-blue-200",
    success: "text-green-700 bg-green-50 border-green-200",
    error: "text-red-700 bg-red-50 border-red-200",
  };

  return (
    <div className={`border rounded-lg px-6 py-8 text-center ${colors[status]}`}>
      <p className="text-lg font-semibold">{message}</p>
      {status === "success" && (
        <button
          onClick={() => window.close()}
          className="mt-4 px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800"
        >
          Close window
        </button>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="max-w-lg mx-auto mt-16">
      <Suspense fallback={<p className="text-center text-gray-500">Loading…</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
