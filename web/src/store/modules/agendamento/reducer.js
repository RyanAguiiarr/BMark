const INITIAL_STATE = {
  agendamentos: [],
};

function agendamento(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "@agendamento/ALL": {
    }
    // eslint-disable-next-line no-fallthrough
    default:
      return state;
  }
}

export default agendamento;
