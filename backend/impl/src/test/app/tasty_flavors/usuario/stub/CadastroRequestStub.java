package app.tasty_flavors.usuario.stub;

import app.tasty_flavors.api.v1.usuario.model.request.CadastroRequest;

public class CadastroRequestStub {
    public static CadastroRequest getCadastroRequest() {
        return CadastroRequest.builder()
                .email("teste123@gmail.com")
                .senha("123456789")
                .build();
    }
}
