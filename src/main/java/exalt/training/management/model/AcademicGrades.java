package exalt.training.management.model;

import exalt.training.management.model.users.Trainee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "academic_grades")
@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = "trainee")
public class AcademicGrades {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private CourseType type;

    private Double mark;

    @ManyToOne
    private Trainee trainee;

    public AcademicGrades(CourseType courseType, Double mark, Trainee trainee) {
        this.type = courseType;
        this.mark = mark;
        this.trainee = trainee;
    }

}
