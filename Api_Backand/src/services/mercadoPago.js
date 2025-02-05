const axios = require('axios');
const { access_token } = require('../data/keys.json'); // Pegando o token de acesso salvo no arquivo JSON

const api = axios.create({
  baseURL: 'https://api.mercadopago.com', // URL correta da API do Mercado Pago
  headers: {
    Authorization: `Bearer ${access_token}`, // Autenticação correta via Bearer Token
    'Content-Type': 'application/json',
  },
});

const mercadoPago = {
  // Criar uma conta bancária (não é necessário no Mercado Pago, mas pode ser útil dependendo do caso)
  createBankAccount: async (data) => {
    try {
      const response = await api.post('/v1/customers', data);
      return { error: false, data: response.data };
    } catch (err) {
      return {
        error: true,
        message: err.response?.data || err.message,
      };
    }
  },

  // Criar um recebedor (equivalente a split de pagamentos no Mercado Pago)
  createRecipient: async (data) => {
    try {
      const response = await api.post('/v1/users', data);
      return { error: false, data: response.data };
    } catch (err) {
      return {
        error: true,
        message: err.response?.data || err.message,
      };
    }
  },

  // Criar um pagamento
  createPayment: async (data) => {
    try {
      const response = await api.post('/v1/payments', data);
      return { error: false, data: response.data };
    } catch (err) {
      return {
        error: true,
        message: err.response?.data || err.message,
      };
    }
  },
};

module.exports = mercadoPago;
