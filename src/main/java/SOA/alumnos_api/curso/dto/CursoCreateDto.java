package SOA.alumnos_api.curso.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoCreateDto {

    @NotBlank(message = "El nombre del curso es obligatorio")
    private String curNom;

    private String curDesc;

    @NotNull(message = "Los créditos son obligatorios")
    private Integer curCreditos;
}
