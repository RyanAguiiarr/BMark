import { all } from "redux-saga/effects";

import agendamento from "./modules/agendamento/saga";
import clientes from "./modules/cliente/saga";

export default function* rootSaga() {
  return yield all([agendamento, clientes]);
}
