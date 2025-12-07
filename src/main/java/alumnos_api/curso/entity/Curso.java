package alumnos_api.curso.entity;

import alumnos_api.alumno.entity.Alumno;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cursos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CUR_ID")
    private Long curId;

    @Column(name = "CUR_NOM", nullable = false, length = 100)
    private String curNom;

    @Column(name = "CUR_DESC", length = 255)
    private String curDesc;

    @Column(name = "CUR_CREDITOS")
    private Integer curCreditos;

    @OneToMany(mappedBy = "curso", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY, orphanRemoval = false)
    @Builder.Default
    private List<Alumno> estudiantes = new ArrayList<>();
}
