package app.tasty_flavors.api.v1.usuario.mapper;

import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;
import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;
import app.tasty_flavors.api.v1.usuario.stub.UsuarioModelStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)

class UsuarioCadastroMapperTest {

    private UsuarioModel usuarioModel;

    @BeforeEach
    void setUp() {
        usuarioModel = UsuarioModelStub.getUsuarioModel();
    }

    @Test
    void deveMapearUsuarioModelParaCadastroResponse() {
        CadastroResponse response =
                UsuarioCadastroMapper.toResponse(usuarioModel);

        assertEquals(usuarioModel.getId(), response.getId());
        assertEquals(usuarioModel.getEmail(), response.getEmail());
    }
}