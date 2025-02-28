import { Button } from "rsuite";
import Table from "../../components/Table";
import "rsuite/dist/rsuite.min.css";
import { useEffect } from "react";
import { allClientes } from "../../store/modules/cliente/action";
import { useDispatch, useSelector } from "react-redux";

const Clientes = () => {
  const dispatch = useDispatch();
  const { clientes } = useSelector((state) => state.clientes);
  useEffect(() => {
    dispatch(allClientes());
  }, []);

  return (
    <div className="col p-5 h-100 overflow-auto">
      <div className="row">
        <div className="col-12">
          <div className="w-100 d-flex justify-content-between">
            <h2 className="mb-4 mt-0">Clientes</h2>
            <div>
              <button className="btn btn-primary btn-lg">
                <span className="mdi mdi-plus"></span>
              </button>
            </div>
          </div>
          <Table
            data={clientes}
            config={[
              { label: "Nome", key: "nome", fixed: true },
              { label: "Email", key: "email" },
              { label: "Telefone", key: "telefone" },
              { label: "Sexo", key: "sexo" },
              { label: "Data Cadastro", key: "dataCadastro" },
            ]}
            actions={(cliente) => (
              <Button color="blue" size="xs">
                Ver {cliente.nome}
              </Button>
            )}
            onrowClick={(cliente) => alert(cliente.email)}
          />
        </div>
      </div>
    </div>
  );
};

export default Clientes;
