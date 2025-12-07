package alumnos_api.security.service;

import alumnos_api.security.dto.LoginRequest;
import alumnos_api.security.dto.LoginResponse;
import alumnos_api.security.entity.Usuario;
import alumnos_api.security.repo.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuario o contraseña incorrectos"));

        // Verificar contraseña usando BCrypt
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new IllegalArgumentException("Usuario o contraseña incorrectos");
        }

        // Generar token simple (en producción usar JWT)
        String token = Base64.getEncoder().encodeToString(
            (usuario.getUsername() + ":" + UUID.randomUUID()).getBytes()
        );

        return LoginResponse.builder()
                .username(usuario.getUsername())
                .rol(usuario.getRol().name())
                .nombreCompleto(usuario.getNombreCompleto())
                .token(token)
                .build();
    }

    @Transactional(readOnly = true)
    public LoginResponse getUserInfo(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return LoginResponse.builder()
                .username(usuario.getUsername())
                .rol(usuario.getRol().name())
                .nombreCompleto(usuario.getNombreCompleto())
                .build();
    }

    @Transactional
    public void inicializarUsuarios() {
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .rol(Usuario.Rol.ADMINISTRADOR)
                    .nombreCompleto("Administrador del Sistema")
                    .build();
            usuarioRepository.save(admin);
        }

        if (!usuarioRepository.existsByUsername("secretaria")) {
            Usuario secretaria = Usuario.builder()
                    .username("secretaria")
                    .password(passwordEncoder.encode("secretaria123"))
                    .rol(Usuario.Rol.SECRETARIA)
                    .nombreCompleto("María Secretaria")
                    .build();
            usuarioRepository.save(secretaria);
        }
    }
}
