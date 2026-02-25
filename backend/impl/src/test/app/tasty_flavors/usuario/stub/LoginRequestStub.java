package app.tasty_flavors.usuario.stub;

import app.tasty_flavors.api.v1.usuario.model.request.LoginRequest;

public class LoginRequestStub {
    public static LoginRequest getLoginRequest() {
        return LoginRequest.builder()
                .email("teste@gmail.com")
                .senha("1234")
                .build();
    }
}

