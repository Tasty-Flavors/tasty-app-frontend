package app.tasty_flavors.usuario.stub;

import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;

public class UsuarioModelStub {
    public static UsuarioModel getUsuarioModel() {
        return UsuarioModel.builder()
                .id(1)
                .email("teste@gmail.com")
                .senha("123456")
                .build();
    }
}
