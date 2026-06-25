import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Início',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />
        }} 
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Meu Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}