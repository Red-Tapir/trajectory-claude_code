'use client'

import CookieConsent from "react-cookie-consent"
import Link from "next/link"

export function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="J'accepte"
      declineButtonText="Je refuse"
      enableDeclineButton
      cookieName="trajectory-cookie-consent"
      style={{
        background: "rgba(0, 0, 0, 0.95)",
        padding: "20px",
        alignItems: "center",
      }}
      buttonStyle={{
        background: "#00876c",
        color: "white",
        fontSize: "14px",
        borderRadius: "6px",
        padding: "10px 30px",
        fontWeight: "500",
      }}
      declineButtonStyle={{
        background: "transparent",
        color: "white",
        fontSize: "14px",
        borderRadius: "6px",
        padding: "10px 30px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
      expires={365}
      onAccept={() => {
        // Enable analytics and tracking
        console.log("Cookie consent accepted")
        // You can enable Google Analytics, Facebook Pixel, etc. here
      }}
      onDecline={() => {
        // Disable analytics and tracking
        console.log("Cookie consent declined")
      }}
    >
      <div className="max-w-4xl">
        <p className="text-white text-sm mb-2">
          <strong>Nous utilisons des cookies</strong>
        </p>
        <p className="text-gray-300 text-xs">
          Ce site utilise des cookies pour améliorer votre expérience, analyser notre trafic et pour des raisons de sécurité.
          En cliquant sur "J'accepte", vous consentez à l'utilisation de TOUS les cookies.
          Consultez notre{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Politique de confidentialité
          </Link>{" "}
          et nos{" "}
          <Link href="/cookies" className="text-primary hover:underline">
            Paramètres de cookies
          </Link>{" "}
          pour plus d'informations.
        </p>
      </div>
    </CookieConsent>
  )
}
