export default function Page(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  return (
    <div style={{fontSize:28,fontWeight:'bold'}}>
      
    </div>
  )
}
