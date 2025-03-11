import { takeLatest, all, call, put, select } from "redux-saga/effects";
import { UpdateClientes } from "./action";
import types from "./types";
import api from "../../../services/api";
import consts from "../../../consts";

export function* allClientes() {
  const { form } = yield select((state) => state.clientes);

  try {
    yield put(UpdateClientes({ form: { ...form, filtering: true } }));
    const { data: res } = yield call(
      api.get,
      `/cliente/salao/${consts.salaoId}`
    );

    yield put(UpdateClientes({ form: { ...form, filtering: false } }));

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(UpdateClientes({ clientes: res.clientes }));
  } catch (error) {
    alert(error.message);
    yield put(UpdateClientes({ form: { ...form, filtering: false } }));
  }
}

export default all([takeLatest(types.ALL_CLIENTES, allClientes)]);
