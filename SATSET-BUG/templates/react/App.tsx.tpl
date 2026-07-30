import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
{{#each modules}}
import {{this.cap}}Page from "./pages/{{this.cap}}Page";
{{/each}}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
{{#each modules}}
  { path: "/{{this.name}}", element: <{{this.cap}}Page /> },
{{/each}}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
