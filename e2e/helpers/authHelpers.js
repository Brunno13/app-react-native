import { by, element, device, waitFor } from 'detox';

const STEP_DELAY_MS = 0;

export const pause = async (ms = STEP_DELAY_MS) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const failIfBlockingModalVisible = async (context) => {
  try {
    await waitFor(element(by.id('notification-modal-error')))
      .toBeVisible()
      .withTimeout(1000);

    throw new Error(`${context}: um modal de erro foi exibido.`);
  } catch (error) {
    if (String(error?.message || '').includes('um modal de erro foi exibido')) {
      throw error;
    }
  }

  try {
    await waitFor(element(by.id('notification-modal-info')))
      .toBeVisible()
      .withTimeout(1000);

    throw new Error(`${context}: um modal informativo/timeout foi exibido.`);
  } catch (error) {
    if (String(error?.message || '').includes('um modal informativo/timeout foi exibido')) {
      throw error;
    }
  }
};

export const waitForLoginScreenReady = async () => {
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(15000);

  await waitFor(element(by.id('input-email')))
    .toBeVisible()
    .withTimeout(15000);

  await waitFor(element(by.id('input-password')))
    .toBeVisible()
    .withTimeout(15000);

  await waitFor(element(by.id('button-login')))
    .toBeVisible()
    .withTimeout(15000);

  await pause();

  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(5000);

  await waitFor(element(by.id('input-email')))
    .toBeVisible()
    .withTimeout(5000);

  await waitFor(element(by.id('button-login')))
    .toBeVisible()
    .withTimeout(5000);
};

export const dismissSuccessModal = async () => {
  await waitFor(element(by.id('notification-modal-success')))
    .toBeVisible()
    .withTimeout(15000);

  await pause();

  const okButton = element(by.id('notification-modal-ok-button'));

  await waitFor(okButton)
    .toBeVisible()
    .withTimeout(5000);

  await pause();

  await okButton.tap();

  await pause();

  await waitFor(element(by.id('notification-modal')))
    .not.toBeVisible()
    .withTimeout(5000);

  await pause();
};

export const performLogin = async (email, password) => {
  await waitForLoginScreenReady();

  await element(by.id('input-email')).replaceText(email);
  await pause();

  await element(by.id('input-email')).tapReturnKey();
  await pause();

  await waitFor(element(by.id('input-password')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('input-password')).replaceText(password);
  await pause();

  await waitFor(element(by.id('input-email')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('input-email')).replaceText(email);
  await pause();

  await waitFor(element(by.id('button-login')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('button-login')).tap();
  await pause();

  await failIfBlockingModalVisible('Falha ao realizar login');

  try {
    await waitFor(element(by.id('tab-profile')))
      .toBeVisible()
      .withTimeout(15000);
  } catch (error) {
    await failIfBlockingModalVisible('Login não chegou na área autenticada');
    throw error;
  }

  await pause();
};

export const performLogout = async () => {
  await waitFor(element(by.id('tab-profile')))
    .toBeVisible()
    .withTimeout(10000);

  await element(by.id('tab-profile')).tap();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await waitFor(element(by.id('button-logout')))
    .toBeVisible()
    .whileElement(by.id('profile-scroll-view'))
    .scroll(300, 'down');

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await element(by.id('button-logout')).tap();
  await pause();

  await waitForLoginScreenReady();
};

export const performPasswordChange = async (currentPass, newPass) => {
  await waitFor(element(by.id('tab-profile')))
    .toBeVisible()
    .withTimeout(10000);

  await element(by.id('tab-profile')).tap();
  await pause();

  await waitFor(element(by.id('link-to-security')))
    .toBeVisible()
    .withTimeout(10000);

  await element(by.id('link-to-security')).tap();
  await pause();

  await waitFor(element(by.id('security-screen')))
    .toBeVisible()
    .withTimeout(10000);

  await pause();

  await element(by.id('input-current-password')).replaceText(currentPass);
  await pause();

  await element(by.id('input-current-password')).tapReturnKey();
  await pause();

  await waitFor(element(by.id('input-new-password')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('input-new-password')).replaceText(newPass);
  await pause();

  await waitFor(element(by.id('button-update-password')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('button-update-password')).tap();
  await pause();

  await dismissSuccessModal();

  if (device.getPlatform() === 'android') {
    await device.pressBack();
  } else {
    await element(by.id('security-screen')).swipe('right', 'fast', 0.2);
  }
  
  await waitFor(element(by.id('profile-scroll-view')))
    .toBeVisible()
    .withTimeout(10000);

  await pause(1000);
};

export const ensureAppIsLoggedOut = async () => {
  try {
    await waitFor(element(by.id('tab-profile')))
      .toBeVisible()
      .withTimeout(3000);

    console.log('🔄 Sessão fantasma detectada no iOS. Forçando logout de limpeza...');
    
    await performLogout();
  } catch (error) {
    
  }
};