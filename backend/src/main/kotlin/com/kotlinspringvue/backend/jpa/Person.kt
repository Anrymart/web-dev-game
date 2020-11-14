package com.kotlinspringvue.backend.jpa

import javax.persistence.*

@Entity
@Table(name = "person")
data class Person(

        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: Long,

        @Column(nullable = false)
        val name: String
)
