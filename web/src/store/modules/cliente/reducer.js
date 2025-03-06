import { produce } from "immer";

import types from "./types";

const INITIAL_STATE = {
  clientes: [],
};

export default function cliente(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_CLIENTES: {
      return produce(state, (draft) => {
        ///{clientes: [ {id: 1, nome: "João Silva", email: "}
        draft = { ...draft, ...action.payload };
        return draft;
      });
    }
    default:
      return state;
  }
}
