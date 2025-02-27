import { Button } from "rsuite";
import Table from "../../components/Table";
import "rsuite/dist/rsuite.min.css";

const clientes = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao.silva@example.com",
    telefone: "(11) 98765-4321",
    dataCadastro: "2024-02-01T10:30:00Z",
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    telefone: "(21) 99876-5432",
    dataCadastro: "2024-01-15T14:45:00Z",
  },
  {
    id: 3,
    nome: "Carlos Souza",
    email: "carlos.souza@example.com",
    telefone: "(31) 91234-5678",
    dataCadastro: "2024-03-10T09:20:00Z",
  },
];

const Clientes = () => {
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
              { label: "Data de Cadastro", key: "dataCadastro" },
            ]}
            actions={(cliente) => (
              <Button color="blue" size="xs">
                Ver {cliente.nome}
              </Button>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Clientes;
