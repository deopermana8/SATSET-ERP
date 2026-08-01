export default function LoginPage(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  return (
    <main className="p-6">
      <h1>{'auth'} Login</h1>
    </main>
  );
}

