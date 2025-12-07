package alumnos_api.alumno.repo;

import alumnos_api.alumno.entity.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, String> {
    
    boolean existsByEstCed(String estCed);
    
    List<Alumno> findByCursoCurId(Long cursoId);
    
    List<Alumno> findByEstCedContaining(String estCed);
}
