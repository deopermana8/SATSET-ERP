export default function Page(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">product Module</h1>
        </div>
    );
}

