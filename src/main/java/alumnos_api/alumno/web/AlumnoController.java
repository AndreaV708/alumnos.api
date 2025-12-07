package alumnos_api.alumno.web;

import alumnos_api.alumno.dto.AlumnoCreateDto;
import alumnos_api.alumno.dto.AlumnoResponseDto;
import alumnos_api.alumno.dto.AlumnoUpdateDto;
import alumnos_api.alumno.dto.AsignarCursoDto;
import alumnos_api.alumno.service.AlumnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
public class AlumnoController {
    
    private final AlumnoService service;
    
    // NOTA: En un sistema real, estos endpoints estarían protegidos por Spring Security
    // Para los fines de esta demostración, la validación de roles se realiza a nivel de frontend

    @GetMapping
    public ResponseEntity<List<AlumnoResponseDto>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{ced}")
    public ResponseEntity<AlumnoResponseDto> byCedula(@PathVariable String ced) {
        return ResponseEntity.ok(service.findByCed(ced));
    }

    @PostMapping
    public ResponseEntity<AlumnoResponseDto> create(@Valid @RequestBody AlumnoCreateDto dto) {
        AlumnoResponseDto alumno = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(alumno);
    }

    @PutMapping("/{ced}")
    public ResponseEntity<AlumnoResponseDto> update(
            @PathVariable String ced, 
            @Valid @RequestBody AlumnoUpdateDto dto) {
        return ResponseEntity.ok(service.update(ced, dto));
    }

    @DeleteMapping("/{ced}")
    public ResponseEntity<Void> delete(@PathVariable String ced) {
        service.delete(ced);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{ced}/asignar-curso")
    public ResponseEntity<AlumnoResponseDto> asignarCurso(
            @PathVariable String ced,
            @Valid @RequestBody AsignarCursoDto dto) {
        AlumnoResponseDto alumno = service.asignarCurso(ced, dto.getCursoId());
        return ResponseEntity.ok(alumno);
    }

    @GetMapping("/{ced}/curso")
    public ResponseEntity<AlumnoResponseDto> obtenerCursoDeEstudiante(@PathVariable String ced) {
        return ResponseEntity.ok(service.obtenerCursoDeEstudiante(ced));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<AlumnoResponseDto>> buscarAlumnoPorCedula(@RequestParam String cedula) {
        List<AlumnoResponseDto> alumnos = service.buscarPorCedula(cedula);
        return ResponseEntity.ok(alumnos);
    }
}
