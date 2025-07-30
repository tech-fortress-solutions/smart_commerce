"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Loading from "@/app/loading";


export default function ProtectedRoute({ children, role }: { children: React.ReactNode; role: "user" | "admin" }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = React.useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // User is not authenticated, redirect to login
                router.replace(`/login?redirect=${pathname}`);
            } else if (user.role !== role) {
                // User does not have the required role, redirect to home
                router.replace("/");
            } else {
                // User is authenticated and has the required role
                setAuthorized(true);
            }
        }
    }, [loading, user, role, pathname, router]);

    if (loading || !authorized) {
        return <Loading />;

    }
    return <>{children}</>;
};
