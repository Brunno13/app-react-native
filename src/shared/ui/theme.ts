export const spacing = {
  sm: 8,
  md: 15,
  lg: 20,
  xl: 40,
};

export const borderRadius = {
  md: 8,
};

export const lightColors = {
  primary: '#007BFF',       
  danger: '#DC3545',        
  dangerLight: '#FFEBEE',
  dangerDark: '#8b0000',    
  background: '#F5F5F5',    
  surface: '#FFFFFF',       
  text: '#333333',          
  textSecondary: '#666666', 
  border: '#DDDDDD',        
  link: '#007BFF',          
  success: '#4CAF50',
  successLight: '#E8F5E9',
  info: '#2196F3',
  infoLight: '#E3F2FD',
};

// 🌙 Cores mapeadas para o Modo Escuro (Contraste otimizado)
export const darkColors = {
  primary: '#3395FF',       // Azul ligeiramente mais vibrante para contraste no preto
  danger: '#FF453A',        // Vermelho padrão iOS Dark
  dangerLight: '#4A1115',   // Fundo de erro (vermelho muito escuro)
  dangerDark: '#FF8A80',    // Ações críticas (vermelho claro para leitura no preto)
  background: '#121212',    // Fundo padrão Dark Mode (Material Design)
  surface: '#1E1E1E',       // Cards e inputs (um pouco mais claros que o fundo)
  text: '#EAEAEA',          // Branco quebrado (não cansa a vista como o #FFF puro)
  textSecondary: '#A0A0A0', // Cinza intermediário
  border: '#333333',        // Bordas sutis no escuro
  link: '#3395FF',          
  success: '#81C784',       // Verde pastel
  successLight: '#1B5E20',  // Fundo de sucesso (verde muito escuro)
  info: '#64B5F6',          // Azul pastel
  infoLight: '#0D47A1',     // Fundo info (azul escuro)
};

export type Colors = typeof lightColors;