package app.tasty_flavors.api.v1.usuario.controller;

import app.tasty_flavors.api.v1.usuario.UsuarioFacade;
import app.tasty_flavors.api.v1.usuario.controller.stub.CadastroRequestStub;
import app.tasty_flavors.api.v1.usuario.controller.stub.CadastroResponseStub;
import app.tasty_flavors.api.v1.usuario.controller.stub.LoginRequestStub;
import app.tasty_flavors.api.v1.usuario.controller.stub.LoginResponseStub;
import app.tasty_flavors.api.v1.usuario.model.request.CadastroRequest;
import app.tasty_flavors.api.v1.usuario.model.request.LoginRequest;
import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;
import app.tasty_flavors.api.v1.usuario.model.response.LoginResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {

    @Mock
    private UsuarioFacade usuarioFacade;
    private LoginResponse loginResponse;
    private LoginRequest loginRequest;
    private CadastroResponse cadastroResponse;
    private CadastroRequest cadastroRequest;
    @InjectMocks
    private UsuarioController usuarioController;

    @BeforeEach
    void setUp() {
        loginRequest = LoginRequestStub.getLoginRequest();
        loginResponse = LoginResponseStub.getLoginResponse();
        cadastroRequest = CadastroRequestStub.getCadastroRequest();
        cadastroResponse = CadastroResponseStub.getCadastroResponse();
    }
    @Test
    void deveRealizarLoginComSucesso() {
        when(usuarioFacade.login(loginRequest)).thenReturn(loginResponse);

        ResponseEntity<LoginResponse> response =
                usuarioController.login(loginRequest);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("mock-jwt-token", response.getBody().getToken());

        verify(usuarioFacade, times(1)).login(loginRequest);
    }

    @Test
    void deveCadastrarUsuarioComSucesso() {
        when(usuarioFacade.cadastrar(cadastroRequest)).thenReturn(cadastroResponse);
        ResponseEntity<CadastroResponse> response =
                usuarioController.cadastrar(cadastroRequest);

        assertEquals(201, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getId());
        verify(usuarioFacade, times(1)).cadastrar(cadastroRequest);
    }
}
