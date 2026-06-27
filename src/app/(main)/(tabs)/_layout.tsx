import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();

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
          title: t('navigation.home'),
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />
        }} 
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: t('navigation.profile'),
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}