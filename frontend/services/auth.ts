const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to login');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong');
  }
};
