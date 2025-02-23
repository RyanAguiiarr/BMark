import { all, takeLatest, call, put } from "redux-saga/effects";
import { updateAgendamento } from "./actions";
import types from "./types";
import api from "../../../services/api";
import consts from "../../../consts";

export function* filterAgendamento({ start, end }) {
  try {
    const { data: res } = yield call(api.post, "/agendamento/filter", {
      periodo: {
        inicio: start,
        fim: end,
      },
      salaoId: consts.salaoId,
    });

    if (res.error) {
      console.log(res.message);
      return false;
    }

    yield put(updateAgendamento(res.agendamentos));
  } catch (err) {
    console.log(err);
  }
}

// escuta a action @agendamento/filter e chama a função filterAgendamento
export default all([takeLatest(types.FILTER_AGENDAMENTOS, filterAgendamento)]);
