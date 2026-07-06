import { device } from 'detox';
import {
  performLogin,
  performLogout,
  performPasswordChange,
  ensureAppIsLoggedOut
} from './helpers/authHelpers';

describe('Fluxo Circular de Alteração de Senha', () => {
  const testEmail = 'e2edetox@detox.com';
  const originalPassword = 'detox123456';
  const tempPassword = '123456detox';

  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      delete: true,
      launchArgs: { detoxInstrumentationLib: 'true' },
    });
    await ensureAppIsLoggedOut();
  });

  it('deve realizar o ciclo completo de alteração de senha e restaurar o estado', async () => {
    // 1. Logar com senha original
    await performLogin(testEmail, originalPassword);

    // 2. Mudar para senha temporária
    await performPasswordChange(originalPassword, tempPassword);

    // 3. Fazer logout
    await performLogout();

    // 4. Logar com senha temporária
    await performLogin(testEmail, tempPassword);

    // 5. Mudar de volta para a senha original
    await performPasswordChange(tempPassword, originalPassword);

    // 6. Fazer logout
    await performLogout();

    // 7. Logar novamente com a senha original
    await performLogin(testEmail, originalPassword);
  });
});