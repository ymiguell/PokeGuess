const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

// Configurações do Express
app.use(cors()); // Permitir CORS
app.use(bodyParser.json()); // Para analisar JSON no corpo da requisição

// Conectar ao banco de dados
const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pokemon'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados');
});

// Endpoint para salvar pontuação
app.post('/save-score', (req, res) => {
  const { nome, pontuacao } = req.body;
  const query = 'INSERT INTO pontuacoes (nome, pontuacao) VALUES (?, ?)';
  db.query(query, [nome, pontuacao], (err, results) => {
    if (err) {
      console.error('Erro ao salvar a pontuação:', err);
      return res.status(500).send('Erro ao salvar a pontuação');
    }
    res.status(200).send('Pontuação salva com sucesso');
  });
});

// Endpoint para buscar ranking
app.get('/ranking', (req, res) => {
  const query = 'SELECT * FROM pontuacoes ORDER BY pontuacao DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar o ranking:', err);
      return res.status(500).send('Erro ao buscar o ranking');
    }
    res.status(200).json(results);
  });
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
