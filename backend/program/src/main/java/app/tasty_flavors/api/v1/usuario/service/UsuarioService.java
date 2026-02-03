package app.tasty_flavors.api.v1.usuario.service;

import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;
import app.tasty_flavors.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioModel login(String email, String senha) {

        UsuarioModel usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Credenciais inválidas")
                );

        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        return usuario;
    }

    public UsuarioModel cadastrar(String email, String senha) {

        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("Email já cadastrado");
        }

        UsuarioModel usuario = UsuarioModel.builder()
                .email(email)
                .senha(passwordEncoder.encode(senha))
                .build();

        return usuarioRepository.save(usuario);
    }
}
