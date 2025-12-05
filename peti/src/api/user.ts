const API_URL = "https://peti-back.onrender.com"

interface UpdateUserResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    nombre: string;
    email: string;
  };
}

interface UpdateUserData {
  nombre?: string;
  email?: string;
  id_usuario: string; // Requerido - ID del usuario a actualizar
}
export const updateUserProfile = async (
  data: UpdateUserData,
  token: string
): Promise<UpdateUserResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/update-user`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json() as UpdateUserResponse;

    if (!response.ok) {
      throw new Error(responseData.message || "Error al actualizar perfil");
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al actualizar perfil");
  }
};