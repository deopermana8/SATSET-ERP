export function LoginForm(){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  return <form>{'Auth'} login form</form>;
}

