

const Base_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const createJob = async (jobData) => {
  const response = await fetch(`${Base_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    throw new Error(`Server returned error (${response.status})`);
  }

  return await response.json();
};

export const getEmployerJobs = async (email) => {
  const url = email
    ? `${Base_URL}/jobs?email=${encodeURIComponent(email)}`
    : `${Base_URL}/jobs`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Server returned error (${response.status})`);
  }

  return await response.json();
};

export const deleteJob = async (jobId) => {
  const response = await fetch(`${Base_URL}/jobs/${jobId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Server returned error (${response.status})`);
  }

  return await response.json();
};

export const updateJob = async (jobId, jobData) => {
  const response = await fetch(`${Base_URL}/jobs/${jobId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    throw new Error(`Server returned error (${response.status})`);
  }

  return await response.json();
};

export const getJobs = async (query = "") => {
  const url = new URL(`${Base_URL}/jobs`);
  if (query) {
    url.search = query;
  }
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Server returned error (${response.status})`);
  }

  return await response.json();
};

