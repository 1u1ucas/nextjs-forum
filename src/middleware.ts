export { auth as middleware } from "@/lib/auth";

export const config = {
    matcher: [
        "/account/:path*",
        "/profile/:path*",
        "/saved/:path*",
        "/conversation/create",
        "/conversation/:path*/create",
        "/reservations/:path*",
    ],
};

