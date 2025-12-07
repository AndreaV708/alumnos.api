package alumnos_api.alumno.service;

import alumnos_api.alumno.dto.AlumnoCreateDto;
import alumnos_api.alumno.dto.AlumnoResponseDto;
import alumnos_api.alumno.dto.AlumnoUpdateDto;
import alumnos_api.alumno.entity.Alumno;
import alumnos_api.alumno.repo.AlumnoRepository;
import alumnos_api.curso.entity.Curso;
import alumnos_api.curso.repo.CursoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumnoService {
    
    private final AlumnoRepository repo;
    private final CursoRepository cursoRepository;

    @Transactional(readOnly = true)
    public List<AlumnoResponseDto> listar() {
        return repo.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AlumnoResponseDto findByCed(String ced) {
        Alumno alumno = repo.findById(ced)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + ced));
        return mapToResponseDto(alumno);
    }

    @Transactional
    public AlumnoResponseDto create(AlumnoCreateDto dto) {
        if (repo.existsById(dto.estCed())) {
            throw new IllegalArgumentException("Alumno existe en el sistema: " + dto.estCed());
        }

        Curso curso = null;
        if (dto.curId() != null) {
            curso = cursoRepository.findById(dto.curId())
                    .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado: " + dto.curId()));
        }

        Alumno alumno = Alumno.builder()
                .estCed(dto.estCed())
                .estNom(dto.estNom())
                .estApe(dto.estApe())
                .estDir(dto.estDir())
                .estTel(dto.estTel())
                .curso(curso)
                .build();

        alumno = repo.save(alumno);
        return mapToResponseDto(alumno);
    }

    @Transactional
    public AlumnoResponseDto update(String ced, AlumnoUpdateDto dto) {
        Alumno alumno = repo.findById(ced)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + ced));
        
        alumno.setEstNom(dto.estNom());
        alumno.setEstApe(dto.estApe());
        alumno.setEstDir(dto.estDir());
        alumno.setEstTel(dto.estTel());

        // Actualizar curso si se proporciona curId
        if (dto.curId() != null) {
            Curso curso = cursoRepository.findById(dto.curId())
                    .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado: " + dto.curId()));
            alumno.setCurso(curso);
        } else {
            alumno.setCurso(null);
        }

        alumno = repo.save(alumno);
        return mapToResponseDto(alumno);
    }

    @Transactional
    public void delete(String ced) {
        Alumno alumno = repo.findById(ced)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + ced));
        repo.delete(alumno);
    }

    @Transactional
    public AlumnoResponseDto asignarCurso(String ced, Long cursoId) {
        Alumno alumno = repo.findById(ced)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + ced));
        
        // Validar que el estudiante no tenga ya un curso asignado
        if (alumno.getCurso() != null) {
            throw new IllegalStateException("El estudiante ya está asignado al curso: " + alumno.getCurso().getCurNom() + 
                    ". Cada estudiante solo puede pertenecer a un curso.");
        }
        
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado: " + cursoId));

        alumno.setCurso(curso);
        alumno = repo.save(alumno);
        
        return mapToResponseDto(alumno);
    }

    @Transactional(readOnly = true)
    public List<AlumnoResponseDto> obtenerEstudiantesPorCurso(Long cursoId) {
        if (!cursoRepository.existsById(cursoId)) {
            throw new EntityNotFoundException("Curso no encontrado: " + cursoId);
        }
        
        return repo.findByCursoCurId(cursoId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AlumnoResponseDto obtenerCursoDeEstudiante(String ced) {
        Alumno alumno = repo.findById(ced)
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + ced));
        return mapToResponseDto(alumno);
    }

    @Transactional(readOnly = true)
    public List<AlumnoResponseDto> buscarPorCedula(String cedula) {
        List<Alumno> alumnos = repo.findByEstCedContaining(cedula);
        return alumnos.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private AlumnoResponseDto mapToResponseDto(Alumno alumno) {
        return AlumnoResponseDto.builder()
                .estCed(alumno.getEstCed())
                .estNom(alumno.getEstNom())
                .estApe(alumno.getEstApe())
                .estDir(alumno.getEstDir())
                .estTel(alumno.getEstTel())
                .cursoId(alumno.getCurso() != null ? alumno.getCurso().getCurId() : null)
                .cursoNombre(alumno.getCurso() != null ? alumno.getCurso().getCurNom() : null)
                .cursoCreditos(alumno.getCurso() != null ? alumno.getCurso().getCurCreditos() : null)
                .build();
    }
}
