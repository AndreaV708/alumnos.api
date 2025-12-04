package SOA.alumnos_api.curso.web;

import SOA.alumnos_api.alumno.dto.AlumnoResponseDto;
import SOA.alumnos_api.curso.dto.CursoCreateDto;
import SOA.alumnos_api.curso.dto.CursoResponseDto;
import SOA.alumnos_api.curso.dto.CursoUpdateDto;
import SOA.alumnos_api.curso.service.CursoService;
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
}
