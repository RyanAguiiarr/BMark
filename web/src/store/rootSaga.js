import { all } from "redux-saga/effects";

import agendamento from "./modules/agendamento/saga";

export default function* rootSaga() {
  return yield all([agendamento]);
}
