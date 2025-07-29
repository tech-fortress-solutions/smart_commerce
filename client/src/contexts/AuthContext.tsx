"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


type User = {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    role: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signup: (data: SignupData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
};

type SignupData = {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
};

type LoginData = {
    email: string;
    password: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/user/verify");
                setUser(response.data.user);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const signup = async (data: SignupData) => {
        try {
            const response = await api.post("/auth/user/register", data);
            setUser(response.data.user);
            router.push("/dashboard");
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        }
    };

    const login = async (data: LoginData) => {
        try {
            const res = await api.post("/auth/user/login", data);
            setUser(res.data.user);
            toast.success("Login successful!");
            // Redirect based on user role
            const searchParams = new URLSearchParams(window.location.search);
            const redirect = searchParams.get("redirect");

            if (redirect) {
                router.push(redirect);
            } else {
                router.push(res.data.user.role === "admin" ? "/admin" : "/dashboard");
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/user/logout");
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};