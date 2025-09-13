const API_URL = "http://localhost:3000/"

export const loginRequest = async (email:string, password:string) => {
  try {
    const response = await fetch(`${API_URL}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Credenciales inválidas");
    }

    return await response.json(); 
  } catch (error) {
    throw error;
  }
};