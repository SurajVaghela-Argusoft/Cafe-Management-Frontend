import axios from "axios";
import Cookies from "js-cookie";

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({ baseURL: API_URL });

// Before every request: attach the current access token
api.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Only one refresh call at a time
let refreshPromise = null;

const refreshTokens = () => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(`${API_URL}/user/refresh`, {
                refresh_token: Cookies.get("refresh_token"),
            })
            .then((res) => {
                const { access_token, refresh_token } = res.data.data;
                Cookies.set("token", access_token, { secure: true, sameSite: "strict" });
                Cookies.set("refresh_token", refresh_token, { secure: true, sameSite: "strict" });
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

// After every response: if 401, refresh and retry once
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const url = original?.url || "";
        const isAuthCall = url.includes("/user/login") || url.includes("/user/refresh");

        if (
            error.response?.status !== 401 ||
            !original ||
            original._retry ||
            isAuthCall ||
            !Cookies.get("refresh_token")
        ) {
            return Promise.reject(error);
        }

        original._retry = true;
        try {
            await refreshTokens();
            return api(original);
        } catch (e) {
            Cookies.remove("token");
            Cookies.remove("refresh_token");
            window.location.href = "/login";
            return Promise.reject(e);
        }
    }
);

export default api;