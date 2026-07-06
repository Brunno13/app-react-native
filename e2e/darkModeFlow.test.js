import { device } from 'detox';
import {
  performLogin,
  performLogout
} from './helpers/authHelpers';

describe('Fluxo de Configuração de Tema (Dark Mode)', () => {
  const testEmail = 'e2edetox@detox.com';
  const originalPassword = 'detox123456';

  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      delete: true,
      launchArgs: { detoxInstrumentationLib: 'true' },
    });
  });

  it('deve navegar pelas opções de tema e alterar para Dark Mode', async () => {
    // 1. Realiza o login com as credenciais padrão
    await performLogin(testEmail, originalPassword);

    await element(by.id('tab-profile')).tap();

    // Um pequeno delay de estabilização para a animação da Tabbar terminar
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2. Em Profile, alterar tema
    await element(by.id('theme-option-dark')).tap();

    // Aguarda a transição visual do tema
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Clica na opção Light apenas para validar que o botão de toggle funciona novamente
    await element(by.id('theme-option-light')).tap();

    // 3. Finaliza o teste garantindo que logout continua ativa
    await performLogout();
  });
});