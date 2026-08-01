import { redirect } from "next/navigation";

export default function Home(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();
  redirect("/dashboard");
}

