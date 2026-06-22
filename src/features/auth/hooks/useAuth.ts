import { useState } from 'react';
import { Alert } from 'react-native';

// ⚠️ ATENÇÃO: Verifique se este caminho aponta para onde o seu auth.ts foi salvo!
// Se você manteve na raiz (lib/auth.ts), o caminho deve ser '../../../../lib/auth' ou algo similar.
import { signIn, signOut, useSession } from '../../../shared/lib/auth';

export const useAuthFlow = () => {
  const [loading, setLoading] = useState(false);
  const { data: session, isPending } = useSession();

  const handleLogin = async (email: string, pass: string) => {
    if (!email || !pass) {
      Alert.alert("Aviso", "Preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      // Dispara a chamada real para a api-bun
      const { error } = await signIn.email({
        email: email,
        password: pass,
      });

      if (error) throw new Error(error.message);
      
    } catch (err: any) {
      Alert.alert("Erro no Login", err.message || "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err: any) {
      Alert.alert("Erro ao sair", err.message);
    }
  };

  return { 
    session, 
    isPending, 
    loading, 
    handleLogin, 
    handleLogout 
  };
};