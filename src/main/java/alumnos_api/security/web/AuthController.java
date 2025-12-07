package alumnos_api.security.web;

import alumnos_api.security.dto.LoginRequest;
import alumnos_api.security.dto.LoginResponse;
import alumnos_api.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/validate/{username}")
    public ResponseEntity<LoginResponse> validateUser(@PathVariable String username) {
        try {
            LoginResponse response = authService.getUserInfo(username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/init-users")
    public ResponseEntity<String> initializeUsers() {
        authService.inicializarUsuarios();
        return ResponseEntity.ok("Usuarios inicializados correctamente");
    }
}
