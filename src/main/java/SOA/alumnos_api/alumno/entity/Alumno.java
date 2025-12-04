package SOA.alumnos_api.alumno.entity;

import SOA.alumnos_api.curso.entity.Curso;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table (name = "alumnos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alumno {

    @Id
    @Column(name = "EST_CED", length = 20)
    private String estCed;

    @Column (name = "EST_NOM", nullable = false, length = 100)
    private String estNom;

    @Column (name = "EST_APE",  nullable = false, length = 100)
    private String estApe;

    @Column (name = "EST_DIR", nullable = false, length = 150)
    private String estDir;

    @Column (name = "EST_TEL", nullable = false, length = 20)
    private String estTel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CUR_ID")
    private Curso curso;
}
