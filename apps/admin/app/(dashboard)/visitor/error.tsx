"use client";

export default function Error(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  return <div>Terjadi kesalahan.</div>
}


