const API_URL = "http://localhost:3000";
const USE_MOCK_DATA = true; //  Cambiar a false cuando el backend esté listo

//  STORAGE EN MEMORIA
let mockStoresStorage: Store[] = [];

export interface Store {
    id_proveedor: string;
    nombre_negocio: string;
    tipo_servicio: string;
    telefono: string;
    email: string;
    descripcion: string;
    image: string; // Base64 o URL
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

// ==========================================
//  FUNCIONES MOCK (SIMULACIÓN EN MEMORIA)
// ==========================================

const getMockStores = (): Store[] => {
    return [...mockStoresStorage];
};

const saveMockStores = (stores: Store[]): void => {
    mockStoresStorage = [...stores];
    console.log(' Tiendas guardadas en memoria:', stores.length);
};

/**
 * Obtener tiendas asociadas a un usuario
 */
export const getUserStores = async (userId: string, token: string): Promise<Store[]> => {
    //  MODO MOCK
    if (USE_MOCK_DATA) {
        console.log(' MOCK: Obteniendo tiendas del usuario', userId);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const allStores = getMockStores();
        const userStores = allStores.filter(store => store.id_usuario === userId);
        
        console.log(' Tiendas encontradas:', userStores.length);
        return userStores;
    }

    //  MODO REAL (Backend)
    try {
        const response = await fetch(`${API_URL}/api/providers/user/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener tus tiendas");
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user stores:', error);
        throw error;
    }
};

/**
 * Actualizar información de una tienda
 */
export const updateStore = async (
    storeId: string,
    data: UpdateStoreData,
    token: string
): Promise<Store> => {
    //  MODO MOCK
    if (USE_MOCK_DATA) {
        console.log(' MOCK: Actualizando tienda', storeId);
        console.log(' Datos:', data);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const allStores = getMockStores();
        const storeIndex = allStores.findIndex(s => s.id_proveedor === storeId);
        
        if (storeIndex === -1) {
            throw new Error('Tienda no encontrada');
        }
        
        // Actualizar tienda
        allStores[storeIndex] = {
            ...allStores[storeIndex],
            ...data
        };
        
        saveMockStores(allStores);
        
        console.log(' MOCK: Tienda actualizada exitosamente');
        return allStores[storeIndex];
    }

    //  MODO REAL (Backend)
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
            const errorData = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message || "Error al actualizar la tienda");
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating store:', error);
        throw error;
    }
};

/**
 * Actualizar imagen de la tienda (Base64)
 */
export const updateStoreImage = async (
    storeId: string,
    imageBase64: string,
    token: string
): Promise<Store> => {
    //  MODO MOCK
    if (USE_MOCK_DATA) {
        console.log(' MOCK: Actualizando imagen de tienda', storeId);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const allStores = getMockStores();
        const storeIndex = allStores.findIndex(s => s.id_proveedor === storeId);
        
        if (storeIndex === -1) {
            throw new Error('Tienda no encontrada');
        }
        
        // Actualizar imagen
        allStores[storeIndex].image = imageBase64;
        saveMockStores(allStores);
        
        console.log(' MOCK: Imagen actualizada exitosamente');
        return allStores[storeIndex];
    }

    //  MODO REAL (Backend)
    try {
        const response = await fetch(`${API_URL}/api/providers/${storeId}/image`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ image: imageBase64 })
        });

        if (!response.ok) {
            throw new Error("Error al actualizar la imagen");
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating image:', error);
        throw error;
    }
};

/**
 * Obtener todas las tiendas MOCK (útil para ver el storage)
 */
export const debugMockStores = (): void => {
    if (USE_MOCK_DATA) {
        const stores = getMockStores();
        console.log(' DEBUG: Tiendas en sistema:', stores);
        console.log(' Total:', stores.length);
    }
};

/**
 * Limpiar todas las tiendas MOCK
 */
export const clearMockStores = (): void => {
    if (USE_MOCK_DATA) {
        mockStoresStorage = [];
        console.log(' Todas las tiendas mock han sido eliminadas');
    }
};

/**
 * Agregar tienda MOCK manualmente (útil para desarrollo)
 */
export const addMockStore = (store: Store): void => {
    if (USE_MOCK_DATA) {
        const allStores = getMockStores();
        allStores.push(store);
        saveMockStores(allStores);
        console.log(' Tienda MOCK agregada:', store.nombre_negocio);
    }
};

/**
 * Sincronizar tiendas registradas con el storage MOCK
 * Llamar esto después de registrar un proveedor para agregarlo al storage
 */
export const syncRegisteredProvider = (providerData: {
    id_proveedor: string;
    nombre_negocio: string;
    tipo_servicio: string;
    telefono: string;
    email: string;
    descripcion?: string;
    id_usuario: string;
}): void => {
    if (USE_MOCK_DATA) {
        const newStore: Store = {
            ...providerData,
            descripcion: providerData.descripcion || '',
            image: 'https://via.placeholder.com/400x250',
            puntuacion: 0.0,
            direccion: ''
        };
        
        const allStores = getMockStores();
        const exists = allStores.some(s => s.id_proveedor === newStore.id_proveedor);
        
        if (!exists) {
            allStores.push(newStore);
            saveMockStores(allStores);
            console.log(' Proveedor sincronizado con storage MOCK');
        }
    }
};