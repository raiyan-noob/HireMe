const Base_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const paymentVerify = async (paymentData) => {
  try {
    const payload =
      typeof paymentData === "string"
        ? { sessionId: paymentData }
        : {
            sessionId: paymentData.sessionId || paymentData.session_id,
            userEmail: paymentData.userEmail || paymentData.email,
            userId: paymentData.userId || paymentData.id,
          };

    const response = await fetch(`${Base_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || `Payment verification failed (${response.status})`);
    }

    return data;
  } catch (err) {
    console.error("Payment verification action error:", err);
    throw err;
  }
};

export const getUserPlanStatus = async (email) => {
  if (!email) return null;
  try {
    const response = await fetch(`${Base_URL}/payments/status/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Error fetching user plan status:", err);
    return null;
  }
};

export const getBillingHistory = async (email) => {
  if (!email) return [];
  try {
    const response = await fetch(`${Base_URL}/payments/history/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error("Error fetching billing history:", err);
    return [];
  }
};
