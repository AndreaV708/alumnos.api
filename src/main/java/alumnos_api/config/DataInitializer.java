package alumnos_api.config;

import alumnos_api.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final AuthService authService;

    @Override
    public void run(ApplicationArguments args) {
        authService.inicializarUsuarios();
        System.out.println("=== USUARIOS INICIALIZADOS ===");
        System.out.println("Administrador: admin / admin123");
        System.out.println("Secretaria: secretaria / secretaria123");
        System.out.println("==============================");
    }
}