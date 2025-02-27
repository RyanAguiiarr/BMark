import { all, takeLatest, call, put } from "redux-saga/effects";
import { updateAgendamento } from "./actions";
import types from "./types";
import api from "../../../services/api";
import consts from "../../../consts";

export function* filterAgendamento({ payload }) {
  // ✅ Correção: acessando payload corretamente
  try {
    const { start, end } = payload; // ✅ Extraindo start e end do payload

    const { data: res } = yield call(api.post, "/agendamento/filter", {
      periodo: {
        inicio: start,
        fim: end,
      },
      salaoId: consts.salaoId,
    });

    console.log("Resposta da API:", res); // ✅ Log para verificar o retorno da API

    if (res.error) {
      console.error("Erro ao buscar agendamentos:", res.message); // ✅ Melhor log para erro da API
      return;
    }

    yield put(updateAgendamento(res.agendamentos)); // ✅ Atualiza o Redux com os agendamentos recebidos
  } catch (err) {
    console.error("Erro no Saga:", err); // ✅ Log de erro
  }
}

// Escuta a action FILTER_AGENDAMENTOS e chama a função filterAgendamento
export default all([takeLatest(types.FILTER_AGENDAMENTOS, filterAgendamento)]);
