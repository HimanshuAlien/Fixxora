const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : (import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api");

export const signupUser = async (data: {
    name: string;
    email: string;
    password: string;
}) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || result.error || "Signup failed");
    }

    return result;
};

export const loginUser = async (data: {
    email: string;
    password: string;
}) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || result.error || "Login failed");
    }

    return result;
};
