package alumnos_api;

import alumnos_api.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@RequiredArgsConstructor
public class AlumnosApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlumnosApiApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(AuthService authService) {
		return args -> {
			authService.inicializarUsuarios();
			System.out.println("✅ Usuarios inicializados:");
			System.out.println("   - admin/admin123 (ADMINISTRADOR)");
			System.out.println("   - secretaria/secretaria123 (SECRETARIA)");
		};
	}

}
