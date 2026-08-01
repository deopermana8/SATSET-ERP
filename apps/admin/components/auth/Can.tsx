"use client";

import { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

type CanProps = {
    permission: string;
    children: ReactNode;
};

export function Can({
    permission,
    children,
}: CanProps) {

    const { hasPermission } = usePermission();

    if (!hasPermission(permission)) {
        return null;
    }

    return <>{children}</>;
}
