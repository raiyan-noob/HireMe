const Base_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const applyForJob = async (applicationData) => {
  try {
    const response = await fetch(`${Base_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `Server returned error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to submit application:", error);
    throw error;
  }
};

export const getApplications = async (email = "") => {
  try {
    const url = email
      ? `${Base_URL}/applications?email=${encodeURIComponent(email)}`
      : `${Base_URL}/applications`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `Server returned error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    throw error;
  }
};


export const getApplicationsCount = async (email = "", jobId = "") => {
  try {
     const url = new URL(`${Base_URL}/applications/count`);
    if (email) url.searchParams.append("email", email);
    if (jobId) url.searchParams.append("jobId", jobId);

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `Server returned error (${response.status})`);
    }

    return await response.json();
  }
  catch (error) {
    console.error("Failed to fetch applications count:", error);
    throw error;
  }
};


export const withdrawApplication = async (applicationId) => {
  try {
    const response = await fetch(`${Base_URL}/applications/${applicationId}`, {
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
    console.error("Failed to withdraw application:", error);
    throw error;
  }
};
