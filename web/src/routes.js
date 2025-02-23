import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./styles.css";

import Agendamentos from "./pages/agendamentos";
import Clientes from "./pages/clientes";

const AppRoutes = () => {
  return (
    <>
      <Header />
      <div className="container-fluid h-100">
        <div className="row h-100">
          <Router>
            <Sidebar />
            <Routes>
              <Route path="/" exact element={<Agendamentos />} />
              <Route path="/clientes" exact element={<Clientes />} />
            </Routes>
          </Router>
        </div>
      </div>
    </>
  );
};

export default AppRoutes;
