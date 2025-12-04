package SOA.alumnos_api.curso.repo;

import SOA.alumnos_api.curso.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    
    Optional<Curso> findByCurNom(String curNom);
    
    boolean existsByCurNom(String curNom);
}
