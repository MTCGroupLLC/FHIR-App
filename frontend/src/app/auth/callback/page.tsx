"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CLIENT_ID = "drls-public";

function getRedirectUri() {
  if (typeof window === "undefined") return "http://localhost:3000/auth/callback";
  return `${window.location.origin}/auth/callback`;
}

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
      setMessage(`Authorization denied: ${error}`);
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
    url.searchParams.set("redirect_uri", getRedirectUri());
    url.searchParams.set("client_id", CLIENT_ID);

    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Authorization complete! You can now search for your records at this endpoint.");
          // Signal parent window (Connect page) and close popup
          if (window.opener) {
            window.opener.postMessage({ type: "auth-complete" }, window.location.origin);
            setTimeout(() => window.close(), 1500);
          }
        } else {
          setStatus("error");
          setMessage(data.detail || "Token exchange failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not reach the backend.");
      });
  }, [params]);

  const colors = {
    pending: "text-blue-700 bg-blue-50 border-blue-200",
    success: "text-green-700 bg-green-50 border-green-200",
    error: "text-red-700 bg-red-50 border-red-200",
  };

  return (
    <div className={`border rounded-lg px-6 py-8 text-center ${colors[status]}`}>
      {status === "pending" && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold">Completing authorization…</span>
        </div>
      )}
      {status !== "pending" && <p className="text-lg font-semibold">{message}</p>}
      {status === "success" && !window.opener && (
        <a href="/" className="mt-4 inline-block px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800">
          Back to search →
        </a>
      )}
      {status === "error" && (
        <button
          onClick={() => window.close()}
          className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg text-sm hover:bg-red-800"
        >
          Close
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
