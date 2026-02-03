package app.tasty_flavors.api.v1.usuario;

import app.tasty_flavors.api.v1.usuario.model.request.CadastroRequest;
import app.tasty_flavors.api.v1.usuario.model.request.LoginRequest;
import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;
import app.tasty_flavors.api.v1.usuario.model.response.LoginResponse;

public interface UsuarioFacade {

    LoginResponse login(LoginRequest request);

    CadastroResponse cadastrar(CadastroRequest request);
}