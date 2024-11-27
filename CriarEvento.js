import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from './firebaseConfig'; // Importe sua configuração do Firebase
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Para adicionar dados ao Firestore
import DateTimePicker from '@react-native-community/datetimepicker'; // Para escolher data e hora

const CriarEvento = ({ navigation }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataHora, setDataHora] = useState(new Date());
  const [localizacao, setLocalizacao] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gostos, setGostos] = useState([]);
  const [gostoSelecionado, setGostoSelecionado] = useState('');
  const [eventoPrivacidade, setEventoPrivacidade] = useState('publico'); // Default para público
  const [senhaConvite, setSenhaConvite] = useState('');
  const [loading, setLoading] = useState(false);
  const user = getAuth().currentUser;

  const gerarCodigoAleatorio = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  };

  useEffect(() => {
    const fetchGostos = async () => {
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setGostos(userData.gostos || []);
          }
        } catch (error) {
          console.error('Erro ao buscar gostos do usuário:', error);
        }
      }
    };

    fetchGostos();
  }, [user]);

  const showDateTimePicker = () => setShowDatePicker(true);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    setDataHora(selectedDate || dataHora);
  };

  const isValidURL = (url) => {
    const regex = new RegExp(
      '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    return !!url.match(regex);
  };

  const handleEventoSubmit = async () => {
    if (!titulo || !descricao || !localizacao || !gostoSelecionado) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (videoLink && !isValidURL(videoLink)) {
      alert('Por favor, insira um link de vídeo válido.');
      return;
    }

    setLoading(true);
    try {
      const codigoEvento = gerarCodigoAleatorio();

      await addDoc(collection(db, 'eventos'), {
        titulo,
        descricao,
        dataHora: serverTimestamp(),
        localizacao,
        videoLink,
        gosto: gostoSelecionado,
        usuarioId: user.uid,
        dataCriacao: serverTimestamp(),
        codigo: codigoEvento,
        privacidade: eventoPrivacidade,
        senhaConvite: eventoPrivacidade === 'privado' ? senhaConvite : null, // Somente adiciona senha se o evento for privado
      });

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar o evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGostoItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.gostoItem, gostoSelecionado === item && styles.gostoItemSelected]}
      onPress={() => setGostoSelecionado(item)}
    >
      <Text style={styles.gostoText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Evento</Text>

      <TextInput
        style={styles.input}
        placeholder="Título do Evento"
        placeholderTextColor="#aaa"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={styles.input}
        placeholder="Descrição do Evento"
        placeholderTextColor="#aaa"
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      <TouchableOpacity onPress={showDateTimePicker} style={styles.input}>
        <Text style={styles.dateText}>{dataHora.toLocaleString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dataHora}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Localização"
        placeholderTextColor="#aaa"
        value={localizacao}
        onChangeText={setLocalizacao}
      />

      <TextInput
        style={styles.input}
        placeholder="Link do Vídeo (opcional)"
        placeholderTextColor="#aaa"
        value={videoLink}
        onChangeText={setVideoLink}
      />

      <Text style={styles.sectionTitle}>Selecione um Gosto:</Text>
      <FlatList
        data={gostos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderGostoItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gostoList}
      />

      {/* Campo de Privacidade */}
      <Text style={styles.sectionTitle}>Privacidade do Evento:</Text>
      <View style={styles.privacidadeOptions}>
        <TouchableOpacity
          style={[styles.privacidadeButton, eventoPrivacidade === 'publico' && styles.selectedPrivacidadeButton]}
          onPress={() => setEventoPrivacidade('publico')}
        >
          <Text style={styles.privacidadeButtonText}>Público</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.privacidadeButton, eventoPrivacidade === 'privado' && styles.selectedPrivacidadeButton]}
          onPress={() => setEventoPrivacidade('privado')}
        >
          <Text style={styles.privacidadeButtonText}>Privado</Text>
        </TouchableOpacity>
      </View>

      {/* Campo de Senha para Convite (apenas se o evento for privado) */}
      {eventoPrivacidade === 'privado' && (
        <TextInput
          style={styles.input}
          placeholder="Senha para Convite"
          placeholderTextColor="#aaa"
          value={senhaConvite}
          onChangeText={setSenhaConvite}
          secureTextEntry
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#9F3EFC" />
      ) : (
        <TouchableOpacity onPress={handleEventoSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Criar Evento</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20,paddingVertical: 35, backgroundColor: '#000' },
  title: { fontSize: 24, color: '#fff', },
  input: { height: 50, borderColor: '#ddd', borderRadius: 15, borderWidth: 1, marginBottom: 10, paddingLeft: 20, color: '#fff' },
  dateText: { fontSize: 16, color: '#aaa' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#fff' },
  gostoList: { flexDirection: 'row', marginBottom: 20 },
  gostoItem: { padding: 10, marginHorizontal: 5, backgroundColor: '#333', borderRadius: 10, height: 50 },
  gostoItemSelected: { backgroundColor: '#9F3EFC' },
  gostoText: { color: '#fff', fontSize: 16 },
  privacidadeOptions: { flexDirection: 'row', marginVertical: 10 },
  privacidadeButton: { 
    backgroundColor: '#333', 
    padding: 10, 
    borderRadius: 10, 
    marginHorizontal: 10 
  },
  selectedPrivacidadeButton: { backgroundColor: '#9F3EFC' },
  privacidadeButtonText: { color: '#fff', fontSize: 16 },
  button: { backgroundColor: '#9F3EFC', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});

export default CriarEvento;
