import { Table, Column, Cell, HeaderCell } from "rsuite";

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
            height={400}
            data={}
            onRowClick={(rowData) => {
              console.log(rowData);
            }}
          >
            <Column width={60} align="center" fixed>
              <HeaderCell>Id</HeaderCell>
              <Cell dataKey="id" />
            </Column>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
