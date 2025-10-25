const API_URL = "http://localhost:3000"

interface AuthResponse {
  success: string,
  data: {
    token: string,
    id: string,
    name: string,
    email: string
  }
}

export const loginRequest = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Credenciales inválidas");
    }

    return (await response.json()) as AuthResponse;
  } catch (error) {
    throw error;
  }
};