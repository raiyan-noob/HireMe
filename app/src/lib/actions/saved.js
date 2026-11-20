const Base_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const saveJob = async (jobData) => {
  try {
    const response = await fetch(`${Base_URL}/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `Server returned error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to save job:", error);
    throw error;
  }
};

export const getSavedJobs = async (email = "") => {
  try {
    const url = email
      ? `${Base_URL}/saved?email=${encodeURIComponent(email)}`
      : `${Base_URL}/saved`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `Server returned error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch saved jobs:", error);
    throw error;
  }
};

export const unsaveJob = async (savedId, email = "") => {
  try {
    const url = email
      ? `${Base_URL}/saved/${savedId}?email=${encodeURIComponent(email)}`
      : `${Base_URL}/saved/${savedId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `Server returned error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to unsave job:", error);
    throw error;
  }
};
