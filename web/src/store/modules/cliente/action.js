import types from "./types";

export function allClientes() {
  return { type: types.ALL_CLIENTES };
}

export function UpdateClientes(payload) {
  return { type: types.UPDATE_CLIENTES, payload };
}

export function FilterClientes() {
  return { type: types.FILTER_CLIENTES };
}
