type Props={
  title:string;
  headers:string[];
  rows:string[][];
}

export default function DataTable({
  title,
  headers,
  rows
}:Props){

  return(

    <div
      style={{
        background:"#fff",
        border:"1px solid #e5e7eb",
        borderRadius:16,
        overflow:"hidden"
      }}
    >

      <div
        style={{
          padding:20,
          borderBottom:"1px solid #e5e7eb",
          fontSize:20,
          fontWeight:700
        }}
      >
        {title}
      </div>

      <table
        style={{
          width:"100%",
          borderCollapse:"collapse"
        }}
      >

        <thead
          style={{
            background:"#f8fafc"
          }}
        >

          <tr>

            {headers.map((h)=>(

              <th
                key={h}
                style={{
                  textAlign:"left",
                  padding:16,
                  borderBottom:"1px solid #e5e7eb"
                }}
              >
                {h}
              </th>

            ))}

          </tr>

        </thead>

        <tbody>

          {rows.map((r,i)=>(

            <tr key={i}>

              {r.map((c,j)=>(

                <td
                  key={j}
                  style={{
                    padding:16,
                    borderBottom:"1px solid #f3f4f6"
                  }}
                >
                  {c}
                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}
