import types from "./types";

export function filterAgendamentos({ start, end }) {
  return {
    type: types.FILTER_AGENDAMENTOS,
    payload: { start, end }, // ✅ Passar dentro de um objeto
  };
}

export function updateAgendamento(agendamentos) {
  return {
    type: types.UPDATE_AGENDAMENTO,
    agendamentos,
  };
}
