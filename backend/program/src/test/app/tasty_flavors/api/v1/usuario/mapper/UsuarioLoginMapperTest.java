package app.tasty_flavors.api.v1.usuario.mapper;


import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;
import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;
import app.tasty_flavors.api.v1.usuario.model.response.LoginResponse;
import app.tasty_flavors.api.v1.usuario.stub.UsuarioModelStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)

class UsuarioLoginMapperTest {

    private UsuarioModel usuarioModel;

    @BeforeEach
    void setUp() {
        usuarioModel = UsuarioModelStub.getUsuarioModel();
    }

    @Test
    void deveMapearUsuarioModelParaLoginResponse() {
        var token = "my-jwt-token";
        LoginResponse response =
                UsuarioLoginMapper.toResponse(usuarioModel, token);

        assertEquals(usuarioModel.getId(), response.getId());
        assertEquals(usuarioModel.getEmail(), response.getEmail());
    }
}