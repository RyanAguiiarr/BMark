import { Table } from "rsuite";

const { Column, Cell, HeaderCell } = Table;

const TableComponent = ({ data, config, actions }) => {
  return (
    <Table height={400} data={data}>
      {config.map((column) => (
        <Column
          flexGrow={!column.width ? 1 : 0}
          key={column.key}
          width={column.width}
          fixed={column.fixed}
        >
          <HeaderCell>{column.label}</HeaderCell>
          <Cell dataKey={column.key} />
        </Column>
      ))}
      <Column width={150} fixed="right">
        <HeaderCell>Acões</HeaderCell>
        <Cell>{(item) => actions(item)}</Cell>
      </Column>
    </Table>
  );
};

export default TableComponent;
