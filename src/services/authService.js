const API_URL = import.meta.env.VITE_API_URL;

export async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.message || "Credenciales incorrectas");
        }
        const data = await response.json();
        return data.data.token;
    } catch (error) {
        throw new Error(error.message || "No se pudo iniciar sesión.");
    }
}

export async function getProfile(token) {
    try {
        const response = await fetch(`${API_URL}/users/perfil`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Token inválido o expirado");
        }
        const data = await response.json();
        return data.data;
    } catch {
        throw new Error("No se pudo obtener el perfil del usuario.");
    }
}

export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.message || "No se pudo registrar el usuario.");
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        throw new Error(error.message || "No se pudo registrar el usuario.");
    }
}
