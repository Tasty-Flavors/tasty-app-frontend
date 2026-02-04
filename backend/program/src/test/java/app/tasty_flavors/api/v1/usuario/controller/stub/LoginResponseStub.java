package app.tasty_flavors.api.v1.usuario.controller.stub;

import app.tasty_flavors.api.v1.usuario.model.response.LoginResponse;

public class LoginResponseStub {
    public static LoginResponse getLoginResponse() {
        return LoginResponse.builder()
                .id(1)
                .email("teste@gmail.com")
                .token("mock-jwt-token")
                .build();
    }
}