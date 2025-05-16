// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import React, { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
  onPaymentSuccess?: (orderData: any) => void;
  onPaymentError?: (error: any) => void;
}

export default function PayPalButton({
  amount,
  currency,
  intent,
  onPaymentSuccess,
  onPaymentError,
}: PayPalButtonProps) {
  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/api/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    console.log("Create order response:", response);
    const output = await response.json();
    console.log("Create order output:", output);
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/api/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    return data;
  };

  const onApprove = async (data: any) => {
    console.log("onApprove", data);
    try {
      const orderData = await captureOrder(data.orderId);
      console.log("Capture result", orderData);
      if (onPaymentSuccess) {
        onPaymentSuccess(orderData);
      }
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  const onCancel = async (data: any) => {
    console.log("onCancel", data);
    // Korisnik je odustao od plaćanja, ne trebamo ništa poduzeti
  };

  const onError = async (data: any) => {
    console.log("onError", data);
    if (onPaymentError) {
      onPaymentError(data);
    }
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
      }
    };

    loadPayPalSDK();
  }, []);
  const initPayPal = async () => {
    try {
      console.log("Fetching PayPal setup...");
      const clientToken: string = await fetch("/api/paypal/setup")
        .then((res) => {
          console.log("PayPal setup response:", res);
          if (!res.ok) {
            throw new Error(`Failed to fetch PayPal setup: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("PayPal setup data:", data);
          return data.clientToken;
        });
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout =
            sdkInstance.createPayPalOneTimePaymentSession({
              onApprove,
              onCancel,
              onError,
            });

      const onClick = async () => {
        console.log("PayPal button clicked!");
        try {
          console.log("Creating order...");
          const checkoutOptionsPromise = createOrder();
          console.log("Starting PayPal checkout...");
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
          console.log("PayPal checkout started");
        } catch (e) {
          console.error("Error in PayPal onClick handler:", e);
          if (onPaymentError) {
            onPaymentError(e);
          }
        }
      };

      const paypalButton = document.getElementById("paypal-button");

      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error(e);
    }
  };

  // Direktni onClick umjesto event listenera
  const handleButtonClick = async () => {
    console.log("PayPal button clicked!");
    try {
      console.log("Creating order...");
      const checkoutOptionsPromise = createOrder();
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken: await fetch("/api/paypal/setup").then(res => res.json()).then(data => data.clientToken),
        components: ["paypal-payments"],
      });
      
      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove,
        onCancel,
        onError,
      });
      
      console.log("Starting PayPal checkout...");
      await paypalCheckout.start(
        { paymentFlow: "auto" },
        checkoutOptionsPromise,
      );
    } catch (e) {
      console.error("PayPal error:", e);
      if (onPaymentError) {
        onPaymentError(e);
      }
    }
  };

  return (
    <button 
      id="paypal-button" 
      onClick={handleButtonClick}
      style={{
        display: "block",
        padding: "10px 30px",
        background: "#0070ba",
        color: "white",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
        textAlign: "center",
        border: "none",
        width: "100%"
      }}
    >
      Plati putem PayPal-a
    </button>
  );
}
// <END_EXACT_CODE>
