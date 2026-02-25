package app.tasty_flavors.usuario.stub;

import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;

public class CadastroResponseStub {
    public static CadastroResponse getCadastroResponse() {
        return CadastroResponse.builder()
                .id(1)
                .email("teste123@gmail.com")
                .build();
    }
}
