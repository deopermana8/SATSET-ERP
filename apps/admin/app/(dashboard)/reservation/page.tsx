import DataTable from "../../../components/DataTable";

export default function ReservationPage(
){
    const {
        canView,
        canCreate,
        canUpdate,
        canDelete
    } = usePermission();

  return(

    <DataTable

      title="Daftar Reservasi"

      headers={[
        "Kode",
        "Nama",
        "Tanggal",
        "Peserta",
        "Status"
      ]}

      rows={[

        ["RSV001","TK ABA 01","24 Jul","120","Lunas"],

        ["RSV002","SDN 02","25 Jul","85","DP"],

        ["RSV003","PT Maju","26 Jul","55","Pending"],

        ["RSV004","SMPN 01","27 Jul","140","Lunas"],

        ["RSV005","Komunitas","28 Jul","32","Batal"]

      ]}

    />

  );

}
