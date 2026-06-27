import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useAuthFlow } from '../../features/auth/hooks/useAuth';
import { uploadAvatarImage } from '../../shared/api/uploadApi';
import { globalStyles } from '../../shared/ui/globalStyles';
import { theme } from '../../shared/ui/theme';

export const EditProfileScreen = () => {
  const { session } = useAuthFlow();
  const { updateUser, loading: authLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  
  const [name, setName] = useState(session?.user?.name || '');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  const displayImage = localImageUri || session?.user?.image;
  const isSubmitting = authLoading || uploading;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      // Salva o base64 se a biblioteca conseguir extraí-lo
      if (result.assets[0].base64) {
        setImageBase64(result.assets[0].base64);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Aviso', 'O nome não pode estar vazio.');
      return;
    }

    const updatePayload: { name?: string; image?: string } = { name };

    if (localImageUri && imageBase64) {
      try {
        setUploading(true);
        // 🔥 Dispara o upload com a string pesada e a URI leve
        const finalImageUrl = await uploadAvatarImage(imageBase64, localImageUri);
        updatePayload.image = finalImageUrl;
      } catch (error) {
        Alert.alert('Erro', 'Falha ao fazer upload da imagem.');
        setUploading(false);
        return; 
      }
    }

    const { error } = await updateUser(updatePayload);
    setUploading(false);
    
    if (error) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o perfil.');
    } else {
      Alert.alert('Sucesso', 'Perfil atualizado!');
      router.back();
    }
  };

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={isSubmitting}>
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
        editable={!isSubmitting}
      />

      <TouchableOpacity 
        style={globalStyles.buttonPrimary} 
        onPress={handleSave} 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
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