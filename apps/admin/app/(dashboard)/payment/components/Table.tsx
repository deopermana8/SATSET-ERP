export default function Table(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  return <div>Table Component</div>
}

