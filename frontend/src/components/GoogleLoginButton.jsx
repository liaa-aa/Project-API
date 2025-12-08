// src/components/GoogleLoginButton.jsx
import { useEffect, useRef } from "react";

const API_BASE_URL = "http://localhost:3333"; // sesuaikan dengan backend-mu

export default function GoogleLoginButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // muat script GSI jika belum ada
  useEffect(() => {
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID belum di-set di .env");
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else if (window.google && window.google.accounts) {
      initGoogle();
    } else {
      existingScript.addEventListener("load", initGoogle);
    }

    function initGoogle() {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      // ❗ width HARUS angka, bukan "100%"
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320, // gunakan angka pixel
        shape: "pill",
      });
    }

    function handleCredentialResponse(response) {
      // token dari Google
      const credential = response.credential;

      // kirim ke backend: /auth/google
      fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Login Google gagal");
          }

          // simpan token / user sesuai kebutuhan app
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          if (onSuccess) onSuccess(data);
        })
        .catch((err) => {
          console.error("Google login error:", err);
          if (onError) onError(err);
        });
    }

    return () => {
      // optional cleanup
    };
  }, [clientId, onSuccess, onError]);

  return (
    <div
      ref={buttonRef}
      style={{ display: "flex", justifyContent: "center" }}
    />
  );
}
