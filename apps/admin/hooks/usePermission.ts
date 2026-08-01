"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

export function usePermission() {
    const { data: session } = useSession();

    const permissions = useMemo(
        () => (session?.user as any)?.permissions ?? [],
        [session]
    );

    const hasPermission = (permission: string) =>
        permissions.includes(permission);

    const hasAnyPermission = (...perms: string[]) =>
        perms.some((p) => permissions.includes(p));

    const hasAllPermissions = (...perms: string[]) =>
        perms.every((p) => permissions.includes(p));

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
