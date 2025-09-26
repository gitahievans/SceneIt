"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const LoginCheckHandler = () => {
    const searchParams = useSearchParams();
    const loginSuccess = searchParams.get('login') === 'unloaded';

    useEffect(() => {
        if (loginSuccess) {
            const url = new URL(window.location.href);
            url.searchParams.delete('login');
            window.history.replaceState({}, '', url.toString());
            window.location.reload();
        }
    }, [loginSuccess]);

    return null;
};

export default LoginCheckHandler;

