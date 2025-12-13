const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  try {
    const response = await fetch(`${API_URL}/auth/admin-login`, {
      method: 'POST',
      credentials:"include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("err",errorData)
      throw new Error(errorData.message || 'Failed to login');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong');
  }
};


export const loginDriver = async (data: { email: string; password: string }) => {
  const res = await fetch(`${API_URL}/auth/ambulance-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw await res.json();
  return res.json();
};

export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // VERY IMPORTANT (clears httpOnly cookie)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to logout");
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
};
