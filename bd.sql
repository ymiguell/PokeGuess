create database pokemon;
use pokemon;

CREATE TABLE pontuacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    pontuacao INT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



