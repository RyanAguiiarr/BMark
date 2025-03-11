import { produce } from "immer";

import types from "./types";

const INITIAL_STATE = {
  behavior: "create", // create, update, read
  components: {
    confirmDelete: false,
    drawer: false,
    tab: "dados-cadastrais", // dados-cadastrais, agendamentos, arquivos
  },
  form: {
    filtering: false,
    disabled: true,
    saving: false,
  },
  cliente: {
    email: "",
    nome: "",
    telefone: "",
    dataNascimento: "",
    sexo: "M",
    documento: {
      tipo: "cpf",
      numero: "",
    },
    endereco: {
      cidade: "",
      uf: "",
      cep: "",
      logradouro: "",
      numero: "",
      pais: "BR",
    },
  },
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
