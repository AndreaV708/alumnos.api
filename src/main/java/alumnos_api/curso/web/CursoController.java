package alumnos_api.curso.web;

import alumnos_api.alumno.dto.AlumnoResponseDto;
import alumnos_api.curso.dto.CursoCreateDto;
import alumnos_api.curso.dto.CursoResponseDto;
import alumnos_api.curso.dto.CursoUpdateDto;
import alumnos_api.curso.service.CursoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CursoController {

    private final CursoService cursoService;
    
    // NOTA: En un sistema real, estos endpoints estarían protegidos por Spring Security
    // Para los fines de esta demostración, la validación se realiza a nivel de frontend

    @PostMapping
    public ResponseEntity<CursoResponseDto> crearCurso(@Valid @RequestBody CursoCreateDto dto) {
        CursoResponseDto curso = cursoService.crearCurso(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(curso);
    }

    @GetMapping
    public ResponseEntity<List<CursoResponseDto>> obtenerTodosLosCursos() {
        List<CursoResponseDto> cursos = cursoService.obtenerTodosLosCursos();
        return ResponseEntity.ok(cursos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoResponseDto> obtenerCursoPorId(@PathVariable Long id) {
        CursoResponseDto curso = cursoService.obtenerCursoPorId(id);
        return ResponseEntity.ok(curso);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoResponseDto> actualizarCurso(
            @PathVariable Long id,
            @Valid @RequestBody CursoUpdateDto dto) {
        CursoResponseDto curso = cursoService.actualizarCurso(id, dto);
        return ResponseEntity.ok(curso);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCurso(@PathVariable Long id) {
        cursoService.eliminarCurso(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/estudiantes")
    public ResponseEntity<List<AlumnoResponseDto>> obtenerEstudiantesPorCurso(@PathVariable Long id) {
        List<AlumnoResponseDto> estudiantes = cursoService.obtenerEstudiantesPorCurso(id);
        return ResponseEntity.ok(estudiantes);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<CursoResponseDto>> buscarCursosPorTitulo(@RequestParam String titulo) {
        List<CursoResponseDto> cursos = cursoService.buscarPorTitulo(titulo);
        return ResponseEntity.ok(cursos);
    }
}
