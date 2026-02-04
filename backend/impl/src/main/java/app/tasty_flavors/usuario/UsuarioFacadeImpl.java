package app.tasty_flavors.usuario;

import app.tasty_flavors.api.v1.usuario.UsuarioFacade;
import app.tasty_flavors.api.v1.usuario.mapper.UsuarioCadastroMapper;
import app.tasty_flavors.api.v1.usuario.mapper.UsuarioLoginMapper;
import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;
import app.tasty_flavors.api.v1.usuario.model.request.CadastroRequest;
import app.tasty_flavors.api.v1.usuario.model.request.LoginRequest;
import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;
import app.tasty_flavors.api.v1.usuario.model.response.LoginResponse;
import app.tasty_flavors.config.JwtService;
import app.tasty_flavors.api.v1.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UsuarioFacadeImpl implements UsuarioFacade {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {
        UsuarioModel usuario = usuarioService.login(
                request.getEmail(),
                request.getSenha()
        );
        String token = jwtService.gerarToken(usuario);
        return UsuarioLoginMapper.toResponse(usuario, token);
    }

    @Override
    public CadastroResponse cadastrar(CadastroRequest request) {

        UsuarioModel usuario = usuarioService.cadastrar(
                request.getEmail(),
                request.getSenha()
        );

        return UsuarioCadastroMapper.toResponse(usuario);
    }
}