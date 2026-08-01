export default function Page(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();

    return(
        <div>
            <h1>ticket</h1>
        </div>
    )

}
