package SOA.alumnos_api.curso.service;

import SOA.alumnos_api.alumno.dto.AlumnoResponseDto;
import SOA.alumnos_api.alumno.entity.Alumno;
import SOA.alumnos_api.curso.dto.CursoCreateDto;
import SOA.alumnos_api.curso.dto.CursoResponseDto;
import SOA.alumnos_api.curso.dto.CursoUpdateDto;
import SOA.alumnos_api.curso.entity.Curso;
import SOA.alumnos_api.curso.repo.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;

    @Transactional
    public CursoResponseDto crearCurso(CursoCreateDto dto) {
        if (cursoRepository.existsByCurNom(dto.getCurNom())) {
            throw new IllegalArgumentException("Ya existe un curso con el nombre: " + dto.getCurNom());
        }

        Curso curso = Curso.builder()
                .curNom(dto.getCurNom())
                .curDesc(dto.getCurDesc())
                .curCreditos(dto.getCurCreditos())
                .build();

        curso = cursoRepository.save(curso);
        return mapToResponseDto(curso);
    }

    @Transactional(readOnly = true)
    public List<CursoResponseDto> obtenerTodosLosCursos() {
        return cursoRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CursoResponseDto obtenerCursoPorId(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + id));
        return mapToResponseDto(curso);
    }

    @Transactional
    public CursoResponseDto actualizarCurso(Long id, CursoUpdateDto dto) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + id));

        if (dto.getCurNom() != null && !dto.getCurNom().equals(curso.getCurNom())) {
            if (cursoRepository.existsByCurNom(dto.getCurNom())) {
                throw new IllegalArgumentException("Ya existe un curso con el nombre: " + dto.getCurNom());
            }
            curso.setCurNom(dto.getCurNom());
        }

        if (dto.getCurDesc() != null) {
            curso.setCurDesc(dto.getCurDesc());
        }

        if (dto.getCurCreditos() != null) {
            curso.setCurCreditos(dto.getCurCreditos());
        }

        curso = cursoRepository.save(curso);
        return mapToResponseDto(curso);
    }

    @Transactional
    public void eliminarCurso(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + id));
        
        // Desasociar estudiantes del curso antes de eliminarlo
        if (curso.getEstudiantes() != null && !curso.getEstudiantes().isEmpty()) {
            for (Alumno alumno : curso.getEstudiantes()) {
                alumno.setCurso(null);
            }
        }
        
        cursoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AlumnoResponseDto> obtenerEstudiantesPorCurso(Long cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + cursoId));

        return curso.getEstudiantes().stream()
                .map(this::mapAlumnoToResponseDto)
                .collect(Collectors.toList());
    }

    private CursoResponseDto mapToResponseDto(Curso curso) {
        return CursoResponseDto.builder()
                .curId(curso.getCurId())
                .curNom(curso.getCurNom())
                .curDesc(curso.getCurDesc())
                .curCreditos(curso.getCurCreditos())
                .cantidadEstudiantes(curso.getEstudiantes() != null ? curso.getEstudiantes().size() : 0)
                .build();
    }

    private AlumnoResponseDto mapAlumnoToResponseDto(Alumno alumno) {
        return AlumnoResponseDto.builder()
                .estCed(alumno.getEstCed())
                .estNom(alumno.getEstNom())
                .estApe(alumno.getEstApe())
                .estDir(alumno.getEstDir())
                .estTel(alumno.getEstTel())
                .cursoId(alumno.getCurso() != null ? alumno.getCurso().getCurId() : null)
                .cursoNombre(alumno.getCurso() != null ? alumno.getCurso().getCurNom() : null)
                .build();
    }
}
