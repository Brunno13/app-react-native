import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useAuthFlow } from '../../features/auth/hooks/useAuth';
import { globalStyles } from '../../shared/ui/globalStyles';
import { theme } from '../../shared/ui/theme';

export const EditProfileScreen = () => {
  const { session } = useAuthFlow();
  const { updateUser, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || '');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const displayImage = localImageUri || session?.user?.image;
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Aviso', 'O nome não pode estar vazio.');
      return;
    }

    // Inicializa o payload com os dados obrigatórios do formulário
    const updatePayload: { name?: string; image?: string } = { name };

    // Se o usuário selecionou uma nova imagem, trata o processo de upload
    if (localImageUri) {
      try {
        // TODO: Implementar a chamada real para a api-bun aqui
        // const finalImageUrl = await uploadImageToBunApi(localImageUri);
        
        // Alerta provisório até a API de upload estar conectada
        Alert.alert('Aviso', 'A lógica de upload da imagem precisa ser implementada na sua api-bun.');
        
        // Se a API retornar a string da URL, adicionar ao payload
        // updatePayload.image = finalImageUrl;
      } catch (error) {
        Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
        return; 
      }
    }

    // Envia o objeto limpo e perfeitamente tipado para o seu hook
    const { error } = await updateUser(updatePayload);
    
    if (error) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o perfil.');
    } else {
      Alert.alert('Sucesso', 'Perfil updated!');
      router.back();
    }
  };

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={globalStyles.avatarLarge} />
        ) : (
          <View style={globalStyles.avatarLarge}>
            <Text style={globalStyles.avatarLargeText}>
              {name.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>Alterar Foto</Text>
        </View>
      </TouchableOpacity>

      <Text style={globalStyles.title}>Atualizar Dados</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Seu nome completo"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={globalStyles.buttonText}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});