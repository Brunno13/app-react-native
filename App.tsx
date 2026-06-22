import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

// Importe as funções do Better Auth. 
// ATENÇÃO: Ajuste o caminho './src/lib/auth' ou './lib/auth' dependendo de onde você salvou o arquivo!
import { signIn, signUp, useSession, signOut } from './src/lib/auth';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Hook do better-auth para verificar a sessão atual no SecureStore
  const { data: session, isPending } = useSession();

  const handleAuthentication = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Fluxo de Login
        const { data, error } = await signIn.email({
          email,
          password,
        });

        if (error) throw new Error(error.message);
        
      } else {
        // Fluxo de Cadastro
        if (!name) {
          setLoading(false);
          return Alert.alert("Erro", "Preencha o seu nome para se cadastrar.");
        }
        
        const { data, error } = await signUp.email({
          email,
          password,
          name,
        });

        if (error) throw new Error(error.message);
        Alert.alert("Sucesso!", "Conta criada com sucesso.");
      }
    } catch (err: any) {
      Alert.alert("Falha na Autenticação", err.message || "Verifique se a API está rodando e acessível.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err: any) {
      Alert.alert("Erro ao sair", err.message || "Não foi possível fazer logout.");
    }
  };

  // 1. Tela de Carregamento (enquanto lê o SecureStore)
  if (isPending) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Carregando sessão...</Text>
      </View>
    );
  }

  // 2. Tela Interna (Usuário Logado)
  if (session) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bem-vindo, {session.user.name}!</Text>
        <Text style={styles.emailText}>Email: {session.user.email}</Text>
        
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Tela Pública (Formulário de Login / Cadastro)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Seu Nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuthentication} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
        <Text style={styles.switchText}>
          {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#DC3545',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#007BFF',
    marginTop: 10,
    fontSize: 14,
  },
});