package app.tasty_flavors.api.v1.usuario.controller;

import app.tasty_flavors.api.v1.usuario.UsuarioFacade;
import app.tasty_flavors.api.v1.usuario.model.request.CadastroRequest;
import app.tasty_flavors.api.v1.usuario.model.request.LoginRequest;
import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;
import app.tasty_flavors.api.v1.usuario.model.response.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioFacade usuarioFacade;

    @GetMapping("/login")
    public ResponseEntity<LoginResponse> login(LoginRequest request) {
        return ResponseEntity.ok(
                usuarioFacade.login(request)
        );
    }

    @PostMapping("/cadastro")
    public ResponseEntity<CadastroResponse> cadastrar(
            @RequestBody CadastroRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioFacade.cadastrar(request));
    }
}
