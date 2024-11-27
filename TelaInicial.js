import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import { auth, db } from './firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const TelaInicial = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [plan, setPlan] = useState(''); // Armazenar o plano do usuário
  const [buttonScale] = useState(new Animated.Value(1));

  const slideAnim = new Animated.Value(-500);


  // Condicionalmente, renderiza a imagem com base no plano
  const renderPlanImage = () => {
    if (plan === 'básico') {
      return <Image source={require('./assets/selos/básico.png')} style={styles.planImage} />;
    } else if (plan === 'premium') {
      return <Image source={require('./assets/selos/premium.png')} style={styles.planImage} />;
    } else if (plan === 'avançado') {
      return <Image source={require('./assets/selos/avançado.png')} style={styles.planImage} />;
    }
    return null; // Caso não haja plano ou plano desconhecido
  };
  // Monitorar o estado de autenticação do usuário
  // Monitorar o estado de autenticação do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Acessar os dados do usuário no Firestore
        const userRef = doc(db, "users", user.uid); // Referência ao documento do usuário
        getDoc(userRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setFullName(userData.fullName); // Obtém o nome completo
              setPlan(userData.plano); // Obtém o plano (básico, premium, avançado, etc.)
            } else {
              console.log("Usuário não encontrado no Firestore");
            }
          })
          .catch((error) => {
            console.log("Erro ao recuperar dados do Firestore:", error);
          });
      } else {
        console.log("Usuário não está logado.");
      }
    });

    return () => unsubscribe(); // Limpeza do listener quando o componente for desmontado
  }, []);

  const handlePress = (tabName) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tabName);
    });
  };

  const toggleContainer = () => {
    Animated.timing(slideAnim, {
      toValue: slideAnim._value === 0 ? -500 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setFullName(userData.fullName);
              setUsername(userData.username);
              setEmail(userData.email);
            } else {
              console.log("Usuário não encontrado no Firestore");
            }
          })
          .catch((error) => {
            console.log("Erro ao recuperar dados do Firestore:", error);
          });
      } else {
        console.log("Usuário não está logado.");
      }
    });

    return () => unsubscribe();
  }, []);

  const eventsData = [
    { id: '1', image: require('./assets/mcigPerfil.jpg'), title: 'Display Expo', description: '' },
    { id: '2', image: require('./assets/mcigPerfil.jpg'), title: 'Belo horz', description: '' },
    { id: '3', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 3', description: '' },
    { id: '4', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 4', description: '' },
    { id: '5', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 5', description: '' },
    { id: '6', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 6', description: '' },
    { id: '7', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 7', description: '' },
  ];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.slideContainer, { transform: [{ translateY: slideAnim }] }]}>
        <ImageBackground
          source={require('./assets/gradienteRoxo.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.slideCima}>
            <TouchableOpacity onPress={toggleContainer}>
              <Image source={require('./assets/mcigPerfil.jpg')} style={styles.slidePerfil1} />
            </TouchableOpacity>
            <View style={styles.slideCimaLado}>

              <Text style={styles.col}>
                34 <View style={styles.col2}><Text>Col</Text></View>
              </Text>

              <View style={styles.barra}></View>

              <Text style={styles.col}>
                5 <View style={styles.col2}><Text>Net</Text></View>
              </Text>

            </View>
          </View>
          <Text style={styles.slideNome}>
          {fullName || 'Nome'}<View style={styles.planImage}>
          {renderPlanImage()}</View> {/* Exibe a imagem se o plano for 'básico' */}
        </Text>
          <Text style={styles.slideUsername}>@{username || 'Usuário'}</Text>
          <Text style={styles.slideEmail}>{email || 'Email'}</Text>

          <View style={styles.slideBotoes}>
            <TouchableOpacity
              style={[styles.slideBotao, activeTab === 'Perfil' && styles.activeTab]}
              onPress={() => handlePress('Perfil')}
            >
              <Animated.View style={{ transform: [{ scale: activeTab === 'Perfil' ? buttonScale : 1 }] }}>
                <Image
                  source={require('./assets/icons/userImg.png')}
                  style={[styles.slideIcon, activeTab === 'Perfil' && { tintColor: 'black' }]}
                />
                <Text style={[styles.slideTextBotao, activeTab === 'Perfil' && styles.activeTabText]}>
                  Perfil
                </Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.slideBotao, activeTab === 'MudarPlano' && styles.activeTab]}
              onPress={() => handlePress('MudarPlano')}
            >
              <Animated.View style={{ transform: [{ scale: activeTab === 'MudarPlano' ? buttonScale : 1 }] }}>
                <Image
                  source={require('./assets/icons/checkImg.png')}
                  style={[styles.slideIcon, activeTab === 'MudarPlano' && { tintColor: 'black' }]}
                />
                <Text style={[styles.slideTextBotao, activeTab === 'MudarPlano' && styles.activeTabText]}>
                  Plano
                </Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.slideBotao, activeTab === 'MaisOpcoes' && styles.activeTab]}
              onPress={() => handlePress('MaisOpcoes')}
            >
              <Animated.View style={{ transform: [{ scale: activeTab === 'MaisOpcoes' ? buttonScale : 1 }] }}>
                <Image
                  source={require('./assets/icons/3pontosImg.png')}
                  style={[styles.slideIcon, activeTab === 'MaisOpcoes' && { tintColor: 'black' }]}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </Animated.View>

      <View style={styles.cimas}>
        <View style={styles.bolaMenu2}>
          <TouchableOpacity onPress={toggleContainer}>
            <Image source={require('./assets/mcigPerfil.jpg')} style={styles.perfil1} />
          </TouchableOpacity>
        </View>

        <Text style={styles.textoCima}>
          Olá, {fullName || 'Usuário'}
        </Text>

        <View style={styles.bolaMenu}>
          <Image source={require('./assets/menuInicial.png')} style={styles.MenuInicial} />
        </View>
      </View>

      <View style={styles.eventsContainer}>
        <FlatList
          data={eventsData}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <TouchableOpacity>
                <Image source={item.image} style={styles.eventImage} />
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDescription}>{item.description}</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.marcar}>
        <View style={styles.escreverCodigo}>
          <Image source={require('./assets/codeImg.png')} style={styles.botaoMarca} />
          <Text style={styles.escreverTexto}>Escrever</Text>
        </View>
        <View style={styles.QRcode}>
          <Image source={require('./assets/QRcodeImg.png')} style={styles.botaoMarca} />
          <Text style={styles.escreverTexto2}>QR code</Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    height: 50,
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  cimas: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    marginTop: 35,
  },
  bolaMenu: {
    width: 40,
    height: 40,
    borderRadius: 1000,
    backgroundColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    borderWidth: 0.5,
    borderColor: '#fff',
  },
  bolaMenu2: {
    width: 40,
    height: 40,
    borderRadius: 1000,
    backgroundColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 'auto',
  },
  perfil1: {
    width: 35,
    height: 35,
    resizeMode: 'cover',
    borderRadius: 100,
  },
  botaoMarca: {
    width: 25,
    height: 25,
    resizeMode: 'cover',
  },
  MenuInicial: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  textoCima: {
    fontSize: 14,
    fontFamily: 'Raleway-SemiBold',
    color: 'white',
    marginLeft: 10,
  },
  eventsContainer: {
    marginTop: 20,
    width: '100%',
  },
  eventItem: {
    marginTop: 10,
    marginHorizontal: 10
  },
  eventImage: {
    width: 165,
    height: 305,
    borderRadius: 30,
    resizeMode: 'cover',
    
  },
  eventTitle: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Raleway-Regular',
    marginTop: 5,
    textAlign: 'center',
  },
  eventDescription: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Raleway-Regular',
    textAlign: 'center',
    marginTop: 3,
  },
  marcar: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  escreverCodigo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171717',
    width: 140,
    height: 43,
    padding: 10,
    borderRadius: 30,
    marginRight: 'auto',
  },
  QRcode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'center',
    width: 150,
    height: 40,
    borderRadius: 30,
    color: 'black',
    marginLeft: 'auto',
  },
  escreverTexto: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Raleway-SemiBold',
    marginLeft: 10,
  },
  escreverTexto2: {
    color: 'black',
    fontSize: 11,
    fontFamily: 'Raleway-Bold',
    marginLeft: 10,
  },

  slideContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
    backgroundColor: '#624199'

  },
  slideNome: {
    color: 'white',
    fontFamily: 'Raleway-Bold',
    fontSize: 30,
    marginTop: 10,
    alignItems: 'center'
  },
  planImage: {
    width: 25,
    height: 25,
    marginLeft: 5, // Para deixar um espaço entre o nome e a imagem
  },
  slideUsername: {
    color: '#f1f1f1'
  },
  slideEmail: {
    color: '#f1f1f1'
  },
  slidePerfil1: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 100,
  },
  slideCima: {
    flexDirection: 'row',
  },
  slideCimaLado: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 100
  },
  col: {
    color: '#f1f1f1',
  },
  barra: {
    height: 40,
    width: 0.5,
    backgroundColor: '#010101',
    marginHorizontal: 10,

  },
  slideBotoes: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
  },
  slideBotao: {
    flexDirection: 'row', // Garante que o ícone e o texto fiquem lado a lado
    paddingHorizontal: 18,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Cor padrão
    alignItems: 'center', // Alinha os itens no centro verticalmente
    justifyContent: 'center', // Alinha os itens horizontalmente
    textAlign: 'center',
    borderRadius: 50,
    margin: 5,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 1)', // Cor de fundo quando ativo
  },
  slideTextBotao: {
    fontSize: 15,
    color: 'white', // Cor do texto padrão
    fontFamily: 'Raleway-Bold',
    marginLeft: 5,
    flexDirection: 'row'
  },
  activeTabText: {
    color: 'black', // Cor do texto quando ativo
    flexDirection: 'row',
  },
  slideIcon: {
    width: 25,
    height: 25,
    tintColor: 'white', // Cor padrão do ícone
  },
  backgroundImage: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,

  },
});

export default TelaInicial;
