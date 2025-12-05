import { Platform } from "react-native";
const API_URL = "https://peti-back.onrender.com";

export interface Store {
    id_proveedor: string;
    nombre_negocio: string;
    tipo_servicio: string;
    telefono: string;
    email: string;
    descripcion: string;
    image_url: string;
    puntuacion: number;
    direccion: string;
    id_usuario: string;
}

export interface UpdateStoreData {
    nombre_negocio?: string;
    tipo_servicio?: string;
    telefono?: string;
    email?: string;
    descripcion?: string;
    direccion?: string;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

export const getUserStores = async (userId: string, token: string): Promise<Store[]> => {
    console.log('🔍 getUserStores - Iniciando...');
    
    if (!userId || !token) {
        throw new Error("userId y token son requeridos");
    }

    const url = `${API_URL}/api/providers/user/${userId}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        console.log('📡 Response status:', response.status);

        const responseText = await response.text();

        if (!response.ok) {
            let errorData: ApiErrorResponse = {};
            
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                console.warn('⚠️ No se pudo parsear error como JSON');
            }
            
            switch (response.status) {
                case 401:
                    throw new Error("Sesión expirada. Por favor inicia sesión nuevamente");
                case 403:
                    throw new Error("No tienes permisos para acceder a estos datos");
                case 404:
                    console.log('ℹ️ 404 - No se encontraron tiendas');
                    return [];
                case 500:
                    throw new Error("Error en el servidor. Intenta más tarde");
                default:
                    throw new Error(errorData.message || "Error al obtener tus tiendas");
            }
        }

        const stores: Store[] = JSON.parse(responseText);
        
        if (!Array.isArray(stores)) {
            throw new Error("Formato de respuesta inválido");
        }

        console.log(`✅ ${stores.length} tiendas encontradas`);
        return stores;
        
    } catch (error) {
        console.error('💥 Error en getUserStores:', error);
        
        if (error instanceof Error) {
            throw error;
        }
        
        throw new Error("Error de conexión. Verifica tu internet");
    }
};

export const updateStore = async (
    storeId: string,
    data: UpdateStoreData,
    token: string
): Promise<Store> => {
    console.log('🔄 updateStore - Iniciando...');

    if (!storeId || !token) {
        throw new Error("storeId y token son requeridos");
    }

    try {
        const response = await fetch(`${API_URL}/api/providers/${storeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
            
            switch (response.status) {
                case 400:
                    throw new Error(errorData.message || "Datos inválidos");
                case 401:
                    throw new Error("Sesión expirada");
                case 404:
                    throw new Error("Tienda no encontrada");
                case 409:
                    throw new Error("Este email ya está en uso");
                default:
                    throw new Error(errorData.message || "Error al actualizar la tienda");
            }
        }

        const result = await response.json() as Store;
        console.log('✅ Store actualizado exitosamente');
        return result;
    } catch (error) {
        console.error('❌ Error en updateStore:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Error de conexión");
    }
};

/**
 * Actualizar imagen de la tienda usando FormData multipart/form-data
 */

export const updateStoreImage = async (
  storeId: string,
  imageUri: string,
  token: string
) => {
  console.log("📤 updateStoreImage");
  const url = `${API_URL}/api/providers/${storeId}/image`;

  const formData = new FormData();

  let file: any;

  if (Platform.OS === "web") {
    // WEB: convertir blob URL a File
    const blobRes = await fetch(imageUri);
    const blob = await blobRes.blob();

    file = new File([blob], "image.jpg", { type: blob.type });

  } else {
    // MOBILE (iOS/Android)
    const filename = imageUri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    file = {
      uri: imageUri,
      name: filename,
      type: type,
    };
  }

  formData.append("image", file);
  formData.append("id_proveedor", storeId);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${await response.text()}`);
  }

  return response.json();
};

export const syncRegisteredProvider = (providerData: {
    id_proveedor: string;
    nombre_negocio: string;
    tipo_servicio: string;
    telefono: string;
    email: string;
    descripcion?: string;
    id_usuario: string;
}): void => {
    console.log('✅ Proveedor registrado:', providerData.nombre_negocio);
};