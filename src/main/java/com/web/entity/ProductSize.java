package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "product_size")
@Getter
@Setter
public class ProductSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String sizeName;

    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "product_color_id")
    @JsonBackReference
    private ProductColor productColor;
}
