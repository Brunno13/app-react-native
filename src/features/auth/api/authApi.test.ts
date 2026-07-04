import { AuthApi } from './authApi';
import { authClient } from '@/shared/lib/auth';

jest.mock('@/shared/lib/auth', () => ({
  authClient: {
    signIn: {
      email: jest.fn(),
      social: jest.fn(),
    },
    signUp: {
      email: jest.fn(),
    },
    forgetPassword: jest.fn(),
    updateUser: jest.fn(),
    changePassword: jest.fn(),
    listSessions: jest.fn(),
    revokeSession: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(),
  }
}));

describe('AuthApi (Camada de Rede de Autenticação)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar login por email repassando os parâmetros corretos', () => {
    AuthApi.signInWithEmail('brunno@teste.com', 'senha123');
    
    expect(authClient.signIn.email).toHaveBeenCalledTimes(1);
    expect(authClient.signIn.email).toHaveBeenCalledWith({
      email: 'brunno@teste.com',
      password: 'senha123',
    });
  });

  it('deve realizar cadastro por email repassando nome, email e senha', () => {
    AuthApi.signUpWithEmail('brunno@teste.com', 'senha123', 'Brunno');
    
    expect(authClient.signUp.email).toHaveBeenCalledWith({
      email: 'brunno@teste.com',
      password: 'senha123',
      name: 'Brunno',
    });
  });

  it('deve formatar a requisição de esqueci a senha com o link de redirecionamento (Deep Link)', () => {
    AuthApi.forgetPassword('brunno@teste.com');
    
    expect((authClient as any).forgetPassword).toHaveBeenCalledWith({
      email: 'brunno@teste.com',
      redirectTo: 'app-react-native://reset-password',
    });
  });

  it('deve realizar login social corretamente', () => {
    AuthApi.signInWithSocial('github');
    
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'github'
    });
  });

  it('deve alterar a senha garantindo a revogação de outras sessões ativas', () => {
    AuthApi.changePassword('NovaSenha!123', 'SenhaAntiga!123');
    expect(authClient.changePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        newPassword: 'NovaSenha!123',
        currentPassword: 'SenhaAntiga!123',
        revokeOtherSessions: true,
      })
    );
  });

  it('deve chamar os métodos de gerenciamento de sessão corretamente', () => {
    AuthApi.listSessions();
    expect(authClient.listSessions).toHaveBeenCalledTimes(1);

    AuthApi.revokeSession('token-xyz');
    expect(authClient.revokeSession).toHaveBeenCalledWith({ token: 'token-xyz' });

    AuthApi.getSession();
    expect(authClient.getSession).toHaveBeenCalledTimes(1);

    AuthApi.signOut();
    expect(authClient.signOut).toHaveBeenCalledTimes(1);
  });
});