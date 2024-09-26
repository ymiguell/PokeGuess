import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, Modal } from 'react-native';
import axios from 'axios';

const MAX_RODADAS = 5; // Define o número máximo de rodadas do jogo

const App = () => {
  // Estados do componente
  const [pokemon, setPokemon] = useState({}); // Armazena os dados do Pokémon atual
  const [palpite, setPalpite] = useState(''); // Armazena o palpite do usuário
  const [retorno, setRetorno] = useState(''); // Mensagem de feedback sobre o palpite
  const [pontuacao, setPontuacao] = useState(0); // Pontuação total do jogador
  const [rodadasRestantes, setRodadasRestantes] = useState(MAX_RODADAS); // Rodadas restantes no jogo
  const [jogoIniciado, setJogoIniciado] = useState(false); // Indica se o jogo foi iniciado
  const [resultadoFinal, setResultadoFinal] = useState(null); // Resultado final do jogo
  const [mostrarBotaoProximo, setMostrarBotaoProximo] = useState(false); // Controle do botão "Próximo Pokémon"
  const [mostrarRanking, setMostrarRanking] = useState(false); // Controle da exibição do ranking
  const [ranking, setRanking] = useState([]); // Armazena o ranking dos jogadores
  const [modalVisible, setModalVisible] = useState(false); // Controle da visibilidade do modal
  const [nome, setNome] = useState(''); // Nome do jogador para salvar a pontuação

  // Efeito para buscar um novo Pokémon quando o jogo é iniciado
  useEffect(() => {
    if (jogoIniciado && rodadasRestantes > 0) {
      buscarNovoPokemon(); // Chama a função para buscar um novo Pokémon
    }
  }, [jogoIniciado]);

  // Efeito para buscar o ranking quando a exibição do ranking é ativada
  useEffect(() => {
    if (mostrarRanking) {
      buscarRanking(); // Chama a função para buscar o ranking
    }
  }, [mostrarRanking]);

  // Função para buscar um Pokémon aleatório da PokeAPI
  const buscarNovoPokemon = async () => {
    try {
      const id = Math.floor(Math.random() * 1000) + 1; // Gera um ID aleatório
      const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`); // Faz a requisição
      const dados = await resposta.json(); // Converte a resposta para JSON
      setPokemon(dados); // Atualiza o estado com os dados do Pokémon
      setRetorno(''); // Limpa a mensagem de retorno
      setMostrarBotaoProximo(false); // Oculta o botão "Próximo Pokémon"
    } catch (erro) {
      console.error(erro); // Loga qualquer erro na busca
    }
  };

  // Função para verificar se o palpite do usuário está correto
  const verificarPalpite = () => {
    if (palpite.toLowerCase() === pokemon.name.toLowerCase()) {
      setRetorno('Correto!'); // Feedback positivo se o palpite estiver correto
      setPontuacao(pontuacao + 1); // Incrementa a pontuação
    } else {
      setRetorno('Incorreto. Tente novamente!'); // Feedback negativo
    }
    setPalpite(''); // Limpa o campo de entrada do palpite
    setRodadasRestantes(rodadasRestantes - 1); // Decrementa as rodadas restantes

    // Verifica se ainda há rodadas restantes
    if (rodadasRestantes > 1) {
      setMostrarBotaoProximo(true); // Mostra o botão para próximo Pokémon
    } else {
      setJogoIniciado(false); // Finaliza o jogo
      setResultadoFinal(pontuacao); // Salva o resultado final
      setModalVisible(true); // Exibe o modal para entrada do nome
    }
  };

  // Função para salvar a pontuação no backend
  const salvarPontuacao = async () => {
    try {
      await axios.post('http://172.16.11.20:3000/save-score', {
        nome, // Nome do jogador
        pontuacao // Pontuação do jogador
      });
      setModalVisible(false); // Fecha o modal após salvar
      setMostrarRanking(true); // Mostra o ranking após salvar a pontuação
    } catch (erro) {
      console.error('Erro ao salvar a pontuação:', erro); // Loga erros ao salvar
    }
  };

  // Função para mostrar o próximo Pokémon
  const mostrarProximoPokemon = () => {
    buscarNovoPokemon(); // Chama a função para buscar um novo Pokémon
    setMostrarBotaoProximo(false); // Oculta o botão para próximo Pokémon
  };

  // Função para reiniciar o jogo
  const reiniciarJogo = () => {
    setPontuacao(0); // Reseta a pontuação
    setRodadasRestantes(MAX_RODADAS); // Reseta as rodadas restantes
    setResultadoFinal(null); // Reseta o resultado final
    setJogoIniciado(true); // Reinicia o jogo
    setMostrarBotaoProximo(false); // Oculta o botão para próximo Pokémon
    setMostrarRanking(false); // Corrige para não mostrar o ranking ao reiniciar
  };

  // Função para buscar o ranking dos jogadores
  const buscarRanking = async () => {
    try {
      const resposta = await axios.get('http://172.16.11.20:3000/ranking'); // Faz a requisição para obter o ranking
      setRanking(resposta.data); // Atualiza o estado com os dados do ranking
    } catch (erro) {
      console.error('Erro ao buscar o ranking:', erro); // Loga erros ao buscar o ranking
    }
  };

  // Função para renderizar cada item do ranking
  const renderRankingItem = ({ item }) => (
    <View style={estilos.itemRanking}>
      <Text style={estilos.textoRanking}>{item.nome}: {item.pontuacao}</Text> {/* Exibe o nome e a pontuação */}
    </View>
  );

  // Componente de botão personalizado
  const BotaoPersonalizado = ({ onPress, titulo, corDeFundo, corTexto }) => (
    <TouchableOpacity style={[estilos.botao, { backgroundColor: corDeFundo }]} onPress={onPress}>
      <Text style={[estilos.textoBotao, { color: corTexto }]}>{titulo}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={estilos.container}>
      {resultadoFinal !== null ? (
        <View style={estilos.telaResultado}>
          <Text style={estilos.tituloResultado}>Pontuação Final</Text>
          <Text style={estilos.pontuacaoResultado}>Você acertou {resultadoFinal} vez(es)!</Text>
          <BotaoPersonalizado 
            titulo="Reiniciar Jogo" 
            onPress={reiniciarJogo} 
            corDeFundo="#2ECC71" 
            corTexto="#FFFFFF" 
          />
        </View>
      ) : !jogoIniciado ? (
        <View style={estilos.telaInicio}>
          <Text style={estilos.titulo}>Bem-vindo ao Jogo de Adivinhação de Pokémon!</Text>
          <BotaoPersonalizado 
            titulo="Começar Jogo" 
            onPress={() => setJogoIniciado(true)} 
            corDeFundo="#3498DB" 
            corTexto="#FFFFFF" 
          />
        </View>
      ) : mostrarRanking ? (
        <View style={estilos.telaRanking}>
          <Text style={estilos.titulo}>Ranking dos Jogadores</Text>
          <FlatList
            data={ranking} // Dados do ranking
            renderItem={renderRankingItem} // Função de renderização dos itens
            keyExtractor={(item, index) => index.toString()} // Chave única para cada item
          />
          <BotaoPersonalizado
            titulo="Voltar ao Início"
            onPress={() => setMostrarRanking(false)} // Volta ao início
            corDeFundo="#E74C3C"
            corTexto="#FFFFFF"
          />
        </View>
      ) : (
        <View style={estilos.telaJogo}>
          <Text style={estilos.titulo}>Adivinhe o Pokémon</Text>
          <Image
            source={{ uri: pokemon.sprites?.front_default }} // Imagem do Pokémon
            style={estilos.imagem}
          />
          <TextInput
            style={estilos.input}
            value={palpite} // Valor do input
            onChangeText={setPalpite} // Atualiza o palpite
            placeholder="Digite o nome do Pokémon"
            placeholderTextColor="#BDC3C7"
          />
          <BotaoPersonalizado 
            titulo="Enviar Palpite" 
            onPress={verificarPalpite} // Verifica o palpite
            corDeFundo="#3498DB" 
            corTexto="#FFFFFF" 
          />
          {retorno ? <Text style={estilos.retorno}>{retorno}</Text> : null} // Mostra o feedback
          <Text style={estilos.pontuacao}>Pontuação: {pontuacao}</Text> // Exibe a pontuação atual
          <Text style={estilos.pontuacao}>Rodadas Restantes: {rodadasRestantes}</Text> // Exibe as rodadas restantes
          {mostrarBotaoProximo ? (
            <BotaoPersonalizado 
              titulo="Próximo Pokémon" 
              onPress={mostrarProximoPokemon} // Mostra o próximo Pokémon
              corDeFundo="#3498DB" 
              corTexto="#FFFFFF" 
            />
          ) : null}
        </View>
      )}

      {/* Modal para entrada do nome */}
      <Modal
        visible={modalVisible} // Controle de visibilidade do modal
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)} // Fecha o modal ao pressionar o botão de voltar
      >
        <View style={estilos.modalContainer}>
          <View style={estilos.modalContent}>
            <Text style={estilos.modalTitle}>Digite seu Nome</Text>
            <TextInput
              style={estilos.modalInput}
              value={nome} // Valor do input para nome
              onChangeText={setNome} // Atualiza o nome
              placeholder="Seu nome"
            />
            <BotaoPersonalizado 
              titulo="Salvar Pontuação" 
              onPress={salvarPontuacao} // Salva a pontuação
              corDeFundo="#2ECC71" 
              corTexto="#FFFFFF" 
            />
            <BotaoPersonalizado 
              titulo="Cancelar" 
              onPress={() => setModalVisible(false)} // Fecha o modal
              corDeFundo="#E74C3C" 
              corTexto="#FFFFFF" 
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F4F8', // Cor de fundo do container
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50', // Cor do texto do título
  },
  tituloResultado: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2ECC71', // Cor do texto do título de resultado
  },
  imagem: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 16,
    borderColor: '#3498DB',
    borderWidth: 2, // Estilo da borda da imagem
  },
  input: {
    height: 40,
    borderColor: '#BDC3C7',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 16,
    width: '80%',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF', // Cor de fundo do input
  },
  retorno: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#E74C3C', // Cor do feedback de retorno
  },
  pontuacao: {
    fontSize: 18,
    marginTop: 16,
    color: '#2C3E50', // Cor da pontuação
  },
  telaInicio: {
    alignItems: 'center', // Alinha os itens ao centro
  },
  telaJogo: {
    alignItems: 'center', // Alinha os itens ao centro
  },
  telaResultado: {
    alignItems: 'center',
    backgroundColor: '#E9ECEF', // Cor de fundo da tela de resultado
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000', // Sombra da tela de resultado
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pontuacaoResultado: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2ECC71', // Cor da pontuação final
    marginBottom: 20,
  },
  botao: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000', // Sombra do botão
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 10,
  },
  textoBotao: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  telaRanking: {
    alignItems: 'center', // Alinha os itens ao centro
    padding: 20,
  },
  itemRanking: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7', // Estilo da borda do item do ranking
    width: '100%',
  },
  textoRanking: {
    fontSize: 18,
    color: '#2C3E50', // Cor do texto do ranking
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo do modal
  },
  modalContent: {
    backgroundColor: '#FFFFFF', // Cor de fundo do conteúdo do modal
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#2C3E50', // Cor do título do modal
  },
  modalInput: {
    height: 40,
    borderColor: '#BDC3C7',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // Cor de fundo do input do modal
  },
});

export default App;
