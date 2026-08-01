export default function Form(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
    return <div>Form product</div>;
}


