package app.tasty_flavors.usuario;

import app.tasty_flavors.api.v1.usuario.stub.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;
import app.tasty_flavors.api.v1.usuario.model.request.LoginRequest;
import app.tasty_flavors.api.v1.usuario.model.request.CadastroRequest;
import app.tasty_flavors.api.v1.usuario.model.response.LoginResponse;
import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;
import app.tasty_flavors.api.v1.usuario.service.UsuarioService;
import app.tasty_flavors.config.JwtService;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioFacadeImplTest {

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private JwtService jwtService;

    private LoginRequest loginRequest;
    private UsuarioModel usuarioModel;
    private CadastroRequest cadastroRequest;

    @InjectMocks
    private UsuarioFacadeImpl usuarioFacadeImpl;

    @BeforeEach
    void setUp() {
        loginRequest = LoginRequestStub.getLoginRequest();
        usuarioModel = UsuarioModelStub.getUsuarioModel();
        cadastroRequest = CadastroRequestStub.getCadastroRequest();
    }
    @Test
    void deveFazerLoginComSucesso() {
        when(usuarioService.login(
                loginRequest.getEmail(),
                loginRequest.getSenha()))
                .thenReturn(usuarioModel);

        when(jwtService.gerarToken(usuarioModel))
                .thenReturn("token-fake");

        LoginResponse response = usuarioFacadeImpl.login(loginRequest);

        assertEquals(usuarioModel.getEmail(), response.getEmail());
        assertEquals("token-fake", response.getToken());

        verify(usuarioService).login(
                loginRequest.getEmail(),
                loginRequest.getSenha());

        verify(jwtService).gerarToken(usuarioModel);
    }

    @Test
    void deveCadastrarComSucesso() {

        when(usuarioService.cadastrar(
                cadastroRequest.getEmail(),
                cadastroRequest.getSenha()))
                .thenReturn(usuarioModel);

        CadastroResponse response = usuarioFacadeImpl.cadastrar(cadastroRequest);

        assertNotNull(response);
        assertEquals(usuarioModel.getEmail(), response.getEmail());

        verify(usuarioService).cadastrar(
                cadastroRequest.getEmail(),
                cadastroRequest.getSenha());
    }
}
