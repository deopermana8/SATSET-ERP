export default function Loading(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
    return <div>Loading...</div>;
}

