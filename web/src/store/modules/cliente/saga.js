import { takeLatest, all, call, put } from "redux-saga/effects";
import { UpdateClientes } from "./action";
import types from "./types";
import api from "../../../services/api";
import consts from "../../../consts";

export function* allClientes() {
  try {
    const { data: res } = yield call(
      api.get,
      `/cliente/salao/${consts.salaoId}`
    );

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(UpdateClientes({ clientes: res.clientes }));
  } catch (error) {
    alert(error.message);
  }
}

export default all([takeLatest(types.ALL_CLIENTES, allClientes)]);
