package com.kotlinspringvue.backend.model

data class DrawingMessage(
        val type: String,
        val features: Map<String, Any>
)