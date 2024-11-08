// pages/api/criarTransacao.js
import pagarme from 'pagarme';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = await pagarme.client.connect({ api_key: process.env.PAGARME_API_KEY });
      const transaction = await client.transactions.create(req.body);
      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
